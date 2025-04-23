// src/lib/format.js

/**
 * Format datetime to HH:mm:ss YYYY/MM/DD
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )} ${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
};

/**
 * Format date to YYYY/MM/DD
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};

/**
 * Format number to money string
 */
export const formatMoney = (amount, currency = "$") => {
  return `${currency}${(amount || 0)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

/**
 * 格式化文件大小，自动选择合适的单位
 * @param {number} bytes - 文件大小（字节）
 * @param {number} decimals - 小数点位数，默认为2
 * @returns {string} 格式化后的文件大小字符串，包含单位
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  // 计算合适的单位级别
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // 转换为相应单位并保留指定小数位
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};
