"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import User from "./tabs/user";
import Assignment from "./tabs/assignment";

const Workspace = () => {
  const [activeTab, setActiveTab] = useState("assignments");

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <User />;
      case "assignments":
        return <Assignment />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 bg-gray-50 min-h-screen">{renderContent()}</main>
    </div>
  );
};

export default Workspace;
