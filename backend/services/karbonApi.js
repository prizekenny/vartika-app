import axios from "axios";

class KarbonApiService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.KARBON_API_URL,
      headers: {
        Authorization: `Bearer ${process.env.KARBON_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
  }

  async getAssignments(params = {}) {
    try {
      const response = await this.client.get("/assignments", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching Karbon assignments:", error);
      throw error;
    }
  }

  async updateAssignmentStatus(assignmentId, status) {
    try {
      const response = await this.client.patch(`/assignments/${assignmentId}`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating Karbon assignment:", error);
      throw error;
    }
  }
}

export const karbonApi = new KarbonApiService();
