"use client";

import React, { useState, useEffect } from "react";
import { FaChartBar, FaListUl } from "react-icons/fa";

import TodoList from "./components/TodoList";
import FinancialSummary from "./components/FinancialSummary";

const DashboardTab = () => {
  // 状态管理
  const [todos, setTodos] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [marketShareData, setMarketShareData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [financialMetrics, setFinancialMetrics] = useState({});
  const [COLORS, setCOLORS] = useState([]);
  const [activeTab, setActiveTab] = useState("todo");

  // 加载仪表板数据
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await import("../../../../../dummy_data/dashboard.json");
        setTodos(data.todos);
        setRevenueData(data.revenueData);
        setMarketShareData(data.marketShareData);
        setGrowthData(data.growthData);
        setExpenseBreakdown(data.expenseBreakdown);
        setFinancialMetrics(data.financialMetrics);
        setCOLORS(data.colors);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };
    loadDashboardData();
  }, []);

  // Toggle task star status
  const toggleStar = (id) => {
    setTodos(
      todos
        .map((todo) => {
          if (todo.id === id) {
            return { ...todo, starred: !todo.starred };
          }
          return todo;
        })
        .sort((a, b) => {
          // Starred tasks first
          if (a.starred === b.starred) return 0;
          return a.starred ? -1 : 1;
        })
    );
  };

  // Delete task
  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="p-6">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h2>

      {/* Navigation */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === "todo"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("todo")}
        >
          <FaListUl className="inline mr-2" />
          To-do List
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "financial"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("financial")}
        >
          <FaChartBar className="inline mr-2" />
          Financial Summary
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "todo" ? (
          <TodoList
            todos={todos}
            toggleStar={toggleStar}
            deleteTodo={deleteTodo}
          />
        ) : (
          // Financial Summary
          <FinancialSummary
            financialMetrics={financialMetrics}
            revenueData={revenueData}
            marketShareData={marketShareData}
            growthData={growthData}
            expenseBreakdown={expenseBreakdown}
            COLORS={COLORS}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardTab;
