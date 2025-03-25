"use client";

import React, { useState } from "react";
import {
  FaUser,
  FaKey,
  FaBell,
  FaFileInvoiceDollar,
  FaUsersCog,
  FaRegCreditCard,
} from "react-icons/fa";

// Import tab components
import ProfileTab from "./profile";
import AuthorizeTab from "./authorize";
import NotificationsTab from "./notifications";
import SubscriptionsTab from "./suscriptions";
import BillingTab from "./billing";
import AccountTab from "./account";

const SettingTab = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-6">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

      {/* Navigation */}
      <div className="flex flex-wrap space-x-4 mb-6 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === "profile"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <FaUser className="inline mr-2" />
          Profile
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "authorize"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("authorize")}
        >
          <FaKey className="inline mr-2" />
          Authorize
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "notifications"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("notifications")}
        >
          <FaBell className="inline mr-2" />
          Notifications
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "subscriptions"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("subscriptions")}
        >
          <FaFileInvoiceDollar className="inline mr-2" />
          Subscriptions
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "billing"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("billing")}
        >
          <FaRegCreditCard className="inline mr-2" />
          Billing
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "account"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("account")}
        >
          <FaUsersCog className="inline mr-2" />
          Account
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "authorize" && <AuthorizeTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "subscriptions" && <SubscriptionsTab />}
        {activeTab === "billing" && <BillingTab />}
        {activeTab === "account" && <AccountTab />}
      </div>
    </div>
  );
};

export default SettingTab;
