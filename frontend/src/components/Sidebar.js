import React from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UserIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  DocumentIcon,
  CreditCardIcon,
  ArrowPathIcon,
  ClipboardIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
  { name: "Users", path: "/users", icon: UserIcon },
  { name: "Settings", path: "/settings", icon: CogIcon },
  { name: "Clients", path: "/clients", icon: UserGroupIcon },
  { name: "Contracts", path: "/contracts", icon: DocumentTextIcon },
  { name: "Invoices", path: "/invoices", icon: DocumentIcon },
  { name: "Transactions", path: "/transactions", icon: CreditCardIcon },
  { name: "Documents", path: "/documents", icon: ClipboardIcon },
  { name: "Assignments", path: "/assignments", icon: ArrowPathIcon },
  { name: "Reports", path: "/reports", icon: ClockIcon },
  {
    name: "Activity Logs",
    path: "/activity-logs",
    icon: ClipboardDocumentListIcon,
  },
];

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-white shadow-lg">
      {/* Logo */}
      <div className="px-6 py-4 border-b">
        <img src="/vartika-logo.svg" alt="Vartika" className="h-8" />
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for..."
            className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100
              ${
                isActive
                  ? "bg-gray-100 text-blue-600 border-r-4 border-blue-600"
                  : ""
              }
            `}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
