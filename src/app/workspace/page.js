"use client";

import React from "react";
import { Tab } from "@headlessui/react";

import DashboardTab from "./tabs/dashboard";
import UserTab from "./tabs/user";
import SettingTab from "./tabs/setting";
import ClientTab from "./tabs/client";
import ContractTab from "./tabs/contract";
import InvoiceTab from "./tabs/invoice";
import TransactionTab from "./tabs/transaction";
import DocumentTab from "./tabs/document";
import AssignmentTab from "./tabs/assignment";
import ReportTab from "./tabs/report";
import LogTab from "./tabs/log";

function Workspace() {
  const tabs = [
    { name: "Dashboard", component: <DashboardTab /> },
    { name: "Users", component: <UserTab /> },
    { name: "Settings", component: <SettingTab /> },
    { name: "Clients", component: <ClientTab /> },
    { name: "Contracts", component: <ContractTab /> },
    { name: "Invoices", component: <InvoiceTab /> },
    { name: "Transactions (Use Case 2)", component: <TransactionTab /> },
    { name: "Documents", component: <DocumentTab /> },
    { name: "Assignments", component: <AssignmentTab /> },
    { name: "Reports", component: <ReportTab /> },
    { name: "Activity Logs", component: <LogTab /> },
  ];

  return (
    <main className="bg-gray-50 min-h-screen flex text-black">
      <Tab.Group as="div" className="flex w-full">
        {/* Left Side: Header + Tabs */}
        <div className="w-1/4 bg-white shadow-lg flex flex-col">
          {/* Header */}
          <header className="bg-blue-500 text-white py-4 px-6 h-36 flex justify-center items-center">
            <h1 className="text-2xl font-bold">Vartika</h1>
          </header>

          {/* Tabs */}
          <Tab.List className="flex flex-col flex-1">
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                className={({ selected }) =>
                  `px-4 py-3 text-left cursor-pointer text-sm font-medium ${
                    selected
                      ? "bg-blue-100 text-blue-600 font-semibold border-l-4 border-blue-500"
                      : "hover:bg-gray-100 text-gray-600"
                  }`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
        </div>

        {/* Right Side: Tab Panels */}
        <div className="flex-1 bg-white shadow-lg p-6">
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
