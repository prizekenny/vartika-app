"use client";

import React from "react";
import { Tab } from "@headlessui/react";
import {
  FaHome,
  FaUsers,
  FaCog,
  FaBuilding,
  FaFileContract,
  FaFileInvoice,
  FaExchangeAlt,
  FaFolder,
  FaTasks,
  FaChartBar,
  FaHistory,
  FaLayerGroup,
  FaSignOutAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

import DashboardTab from "./tabs/dashboard/dashboard";
import UserTab from "./tabs/user";
import SettingTab from "./tabs/settings/setting";
import ClientTab from "./tabs/clients/client";
import ContractTab from "./tabs/contract";
import InvoiceTab from "./tabs/invoice";
import TransactionTab from "./tabs/transaction";
import DocumentTab from "./tabs/document";
import AssignmentTab from "./tabs/assignment";
import ReportTab from "./tabs/report";
import LogTab from "./tabs/log";

import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Workspace() {
  const router = useRouter();
  const { user, setUser } = useUser();

  // Check if user is logged in, if not, redirect to login page
  useEffect(() => {
    if (!user) {
      console.log("User not logged in. Redirecting to login...");
      router.push("/login"); // Redirect to login page if user is not logged in
    }
  }, [user, router]); // Depend on user state to check login status

  const allTabs = [
    { name: "Dashboard", icon: <FaHome />, component: <DashboardTab /> },
    { name: "Users", icon: <FaUsers />, component: <UserTab /> },
    { name: "Settings", icon: <FaCog />, component: <SettingTab /> },
    { name: "Clients", icon: <FaBuilding />, component: <ClientTab /> },
    { name: "Contracts", icon: <FaFileContract />, component: <ContractTab /> },
    { name: "Invoices", icon: <FaFileInvoice />, component: <InvoiceTab /> },
    {
      name: "Transactions",
      icon: <FaExchangeAlt />,
      component: <TransactionTab />,
    },
    { name: "Documents", icon: <FaFolder />, component: <DocumentTab /> },
    { name: "Assignments", icon: <FaTasks />, component: <AssignmentTab /> },
    { name: "Reports", icon: <FaChartBar />, component: <ReportTab /> },
    { name: "Activity Logs", icon: <FaHistory />, component: <LogTab /> },
  ];

  const tabs = user?.roles?.some(
    (role) => !["employee", "admin", "super admin"].includes(role.toLowerCase())
  )
    ? allTabs.filter((tab) =>
        [
          "Dashboard",
          "Settings",
          "Contracts",
          "Invoices",
          "Documents",
        ].includes(tab.name)
      )
    : allTabs;

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setUser(null);

        // 清除本地存储中的用户数据
        localStorage.removeItem("user");
        router.push("/login");
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.log("⚠️ Error during logout:", error);
      alert("An error occurred during logout. Please try again.");
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen flex text-black">
      <Tab.Group as="div" className="flex w-full">
        {/* Left Side: Header + Tabs */}
        <div className="w-[220px] bg-white shadow-md flex flex-col">
          {/* Header */}
          <header className="bg-gray-900 text-white py-8 px-6">
            <div className="flex flex-col items-center space-y-2">
              <FaLayerGroup className="text-3xl text-blue-400" />
              <h1 className="text-2xl font-bold tracking-wide">Vartika</h1>

              {/* Current User Info */}
              {user && (
                <div className="text-center text-sm mt-4">
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-gray-300">{user.email}</p>
                </div>
              )}
            </div>
          </header>

          {/* Tabs */}
          <div className="flex flex-col flex-1">
            <Tab.List className="flex flex-col flex-1 py-4">
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  className={({ selected }) =>
                    classNames(
                      "flex items-center px-4 py-3 my-1 mx-2 text-left cursor-pointer text-sm font-medium rounded-lg transition-colors duration-150",
                      selected
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "hover:bg-gray-50 text-gray-600"
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={classNames(
                          "mr-3 text-lg",
                          selected ? "text-blue-500" : "text-gray-400"
                        )}
                      >
                        {tab.icon}
                      </span>
                      {tab.name}
                    </>
                  )}
                </Tab>
              ))}
            </Tab.List>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 mx-2 mb-4 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-colors duration-150"
            >
              <FaSignOutAlt className="mr-3 text-lg opacity-75" />
              Logout
            </button>
          </div>
        </div>

        {/* Right Side: Tab Panels */}
        <div className="flex-1 bg-white p-8">
          <Tab.Panels>
            {tabs.map((tab, index) => (
              <Tab.Panel key={index} className="focus:outline-none">
                {tab.component}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </div>
      </Tab.Group>
    </main>
  );
}

export default Workspace;
