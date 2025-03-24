"use client";

import React from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaDollarSign,
  FaPercentage,
} from "react-icons/fa";

const FinancialMetricCard = ({
  title,
  value,
  change,
  positive,
  bgColor,
  icon,
}) => {
  return (
    <div className={`bg-gradient-to-br ${bgColor} p-4 rounded-lg`}>
      <div className="flex items-center justify-between">
        <div className="text-2xl">{icon}</div>
        <div
          className={`flex items-center ${
            positive ? "text-green-500" : "text-red-500"
          }`}
        >
          <span className="text-sm">{change}</span>
          {positive ? (
            <FaArrowUp className="ml-1" />
          ) : (
            <FaArrowDown className="ml-1" />
          )}
        </div>
      </div>
      <h4 className="text-gray-600 mt-2">{title}</h4>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default FinancialMetricCard;
