// components/common/StatusBadge.jsx

import React from "react";
import { twMerge } from "tailwind-merge";

const StatusBadge = ({ status }) => {
  const getColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("progress")) return "bg-blue-100 text-blue-800";
    if (s.includes("complete")) return "bg-green-100 text-green-800";
    if (s.includes("plan")) return "bg-yellow-100 text-yellow-800";
    if (s.includes("error")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <span
      className={twMerge(
        "px-2 py-1 rounded-full text-sm whitespace-nowrap",
        getColor(status)
      )}
    >
      {status || "Unknown"}
    </span>
  );
};

export default StatusBadge;
