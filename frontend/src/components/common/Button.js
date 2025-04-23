// components/common/Button.jsx

import React from "react";
import { twMerge } from "tailwind-merge";

const variantStyles = {
  primary: "border border-[#9C1C53] text-[#9C1C53] hover:bg-[#9C1C53]/10",
  secondary: "border border-gray-400 text-gray-700 hover:bg-gray-100",
  danger: "border border-red-500 text-red-500 hover:bg-red-100",
};

const Button = ({
  icon,
  text,
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        "flex items-center rounded-md py-2 px-4 transition",
        variantStyles[variant] || variantStyles.primary,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text || children}
    </button>
  );
};

export default Button;
