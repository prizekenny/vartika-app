import { quickbooksAuthClient } from "../config/quickbooksAuth.js";

import { updateToken } from "./tokenService.js";
import axios from "axios";

const QUICKBOOKS_BASE_URL =
  process.env.QUICKBOOKS_ENV === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";

class QuickBooksClient {
  constructor(token) {
    if (!token || !token.access_token || !token.realm_id) {
      throw new Error("Invalid QuickBooks token");
    }
    this.accessToken = token.access_token;
    this.refreshToken = token.refresh_token;
    this.realmId = token.realm_id;
    this.expiresAt = token.expires_at;
    this.userEmail = token.user_email;
    this.client = quickbooksAuthClient;
    this.client.setToken(this.accessToken);
  }

  async #refreshAccessToken() {
    const res = await axios.post(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const newToken = res.data;
    const newExpiresAt = new Date(Date.now() + newToken.expires_in * 1000);
    await updateToken(
      this.userEmail,
      "quickbooks",
      newToken.access_token,
      newToken.refresh_token || this.refreshToken,
      this.realmId,
      newExpiresAt
    );

    this.accessToken = newToken.access_token;
    this.refreshToken = newToken.refresh_token || this.refreshToken;
    this.expiresAt = newExpiresAt;
    this.client.setToken(this.accessToken);

    console.log(
      `✅ Token refreshed for ${this.userEmail} (${this.realmId}) (${newExpiresAt})`
    );
  }

  async #ensureValidToken() {
    if (
      !this.expiresAt ||
      new Date() >= new Date(this.expiresAt) - 5 * 60 * 1000
    ) {
      await this.#refreshAccessToken();
    }
  }

  async getCompanyInfo() {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/companyinfo/${this.realmId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });
    return response.json || response.response?.data;
  }

  async getInvoices() {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/query?query=SELECT * FROM Invoice`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });
    return response.json || response.response?.data;
  }

  async isAuthorized() {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/companyinfo/${this.realmId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });
    const data = response.json || response.response?.data;
    return { authorized: true, company: data };
  }

  async reportProfitAndLoss(options = {}) {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/reports/ProfitAndLoss`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
      params: options,
    });
    return response.response?.data;
  }

  async reportProfitAndLossDetail(options = {}) {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/reports/ProfitAndLossDetail`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
      params: options,
    });
    return response.response?.data;
  }
}

export { QuickBooksClient };
