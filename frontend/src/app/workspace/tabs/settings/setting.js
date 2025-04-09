"use client";

import React, { useState, useEffect } from "react";
import { FaUser, FaKey } from "react-icons/fa";

// Import tab components
import ProfileTab from "./profile";
import AuthorizeTab from "./authorize";

const SettingTab = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone: "",
    // 其他用戶數據欄位
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 獲取用戶數據
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // 從API獲取用戶數據
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        setMessage("Error loading user data: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 處理數據更新
  const handleSaveData = async (updatedData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update user data');
      
      setUserData(updatedData);
      setMessage("User data updated successfully!");
    } catch (error) {
      setMessage("Error updating user data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {message}
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "profile" && <ProfileTab userData={userData} onSave={handleSaveData} isLoading={isLoading} />}
        {activeTab === "authorize" && <AuthorizeTab userData={userData} onSave={handleSaveData} isLoading={isLoading} />}
      </div>
    </div>
  );
};

export default SettingTab;
