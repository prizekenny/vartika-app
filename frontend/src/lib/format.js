// src/lib/format.js

/**
 * Format datetime to HH:mm:ss YYYY/MM/DD
 */
export const formatDateTime = (date) => {
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )} ${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
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
