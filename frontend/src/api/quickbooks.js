import api from "@/lib/axios";
import { safeApiGet } from "@/lib/safeApiGet";

export const getCompanyInfo = () => {
  return safeApiGet("/api/quickbooks/company");
};

export const getInvoices = (params) => {
  return safeApiGet("/api/quickbooks/invoices", { params });
};

export const checkAuthorization = () => {
  return safeApiGet("/api/quickbooks/authorized");
};

export const getProfitAndLoss = (params) => {
  return safeApiGet("/api/quickbooks/reports/profit-and-loss", { params });
};

export const getProfitAndLossDetail = (params) => {
  return safeApiGet("/api/quickbooks/reports/profit-and-loss-detail", {
    params,
  });
};

export const getBalanceSheet = (params) => {
  return safeApiGet("/api/quickbooks/reports/balance-sheet", { params });
};

export const getCashFlow = (params) => {
  return safeApiGet("/api/quickbooks/reports/cash-flow", { params });
};

export const getFinancialOverview = (params) => {
  return safeApiGet("/api/quickbooks/reports/overview", { params });
};

export const getTransactions = (params) => {
  return safeApiGet("/api/quickbooks/transactions", { params });
};

export const exportInvoices = () => {
  return safeApiGet(
    "/api/quickbooks/invoices/export",
    { responseType: "blob" },
    {
      fileDownload: true,
      fileName: `invoices_${new Date().toISOString().slice(0, 10)}.xlsx`,
      successMessage: "Invoices exported successfully!",
      errorMessage: "Invoice export failed, please try again.",
    }
  );
};
export const downloadInvoicePdf = async (invoiceId) => {
  try {
    const res = await api.get(`/api/quickbooks/invoices/${invoiceId}/pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${invoiceId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("❌ Failed to download invoice PDF:", error);
  }
};
