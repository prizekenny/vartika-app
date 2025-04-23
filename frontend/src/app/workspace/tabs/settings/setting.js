"use client";

import React, { useState } from "react";
import {
  FaUser,
  FaKey,
  FaBell,
} from "react-icons/fa";
import { useUser } from "@/context/UserContext";

// Import tab components
import ProfileTab from "./profile";
import AuthorizeTab from "./authorize";
import NotificationsTab from "./notifications";

const SettingTab = () => {
  const { user } = useUser();
  const isClient = user?.roles?.map(role => role.toLowerCase()).includes('client');
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
        {/* 仅对非client用户显示Authorize标签页 */}
        {!isClient && (
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
        )}
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
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "authorize" && !isClient && <AuthorizeTab />}
        {activeTab === "notifications" && <NotificationsTab />}
      </div>
    </div>
  );
};

export default SettingTab;
