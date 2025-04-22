// src/lib/safeApiGet.js
import api from "@/lib/axios";
import toast from "react-hot-toast";

/**
 * 通用 GET 请求封装（支持 JSON / Blob）
 * @param {string} url - 请求路径
 * @param {object} options - 请求选项，如 { params, responseType }
 * @param {object} config - 配置项，如 { fileDownload: true, fileName: 'xxx.xlsx' }
 */
export const safeApiGet = async (url, options = {}, config = {}) => {
  try {
    const res = await api.get(url, options);

    if (config.fileDownload) {
      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute(
        "download",
        config.fileName ||
          `download_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(config.successMessage || "Downloaded successfully!");
      return;
    }

    return res.data;
  } catch (error) {
    console.error("❌ API error:", error);
    toast.error(config.errorMessage || "Request failed, please try again.");
    return null;
  }
};

export const safeApiPost = async (url, data = {}, config = {}) => {
  try {
    const res = await api.post(url, data);
    return res.data;
  } catch (error) {
    console.error("❌ POST error:", error);
    toast.error(config.errorMessage || "Failed to submit data");
    return null;
  }
};

export const safeApiPut = async (url, data = {}, config = {}) => {
  try {
    const res = await api.put(url, data);
    return res.data;
  } catch (error) {
    console.error("❌ PUT error:", error);
    toast.error(config.errorMessage || "Failed to update");
    return null;
  }
};

export const safeApiDelete = async (url, config = {}) => {
  try {
    const res = await api.delete(url);
    return res.data;
  } catch (error) {
    console.error("❌ DELETE error:", error);
    toast.error(config.errorMessage || "Failed to delete");
    return null;
  }
};
