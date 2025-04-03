// src/api/log.js
import api from "@/lib/axios";
import toast from "react-hot-toast";

export const getLogs = ({
  page = 1,
  pageSize = 10,
  user_email = "",
  sortField = "created_at",
  sortDirection = "desc",
} = {}) => {
  return api.get("/api/logs/user-logs", {
    params: {
      page,
      pageSize,
      user_email,
      sortField,
      sortDirection,
    },
  });
};

export const exportLogs = async () => {
  try {
    const res = await api.get("/api/logs/user-logs/export", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `user_logs_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Exported successfully!");
  } catch (error) {
    toast.error("Export failed, please try again.");
  }
};
