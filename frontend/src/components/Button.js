import React from "react";
import Image from "next/image";

const Button = ({ icon, text, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center border border-blue-500 rounded-md py-2 px-4 text-blue-500 hover:bg-blue-100 transition ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>} {/* Render icon */}
      {text}
    </button>
  );
};

export default Button;
