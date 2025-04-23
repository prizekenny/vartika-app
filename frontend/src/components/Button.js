import React from "react";

const Button = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const baseStyles = "rounded-lg transition-colors duration-200";

  const variants = {
    primary: "bg-[#4F46E5] hover:bg-[#4338CA] text-white",
    default: "bg-white hover:bg-gray-50 border border-gray-300 text-gray-700",
    pagination: "px-3 py-1 text-sm border border-gray-200",
    paginationActive: "px-3 py-1 text-sm bg-[#9C1C53] text-white",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
