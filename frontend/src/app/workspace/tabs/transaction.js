"use client";

import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Pagination from "../../../components/common/Pagination";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getTransactions } from "@/api/quickbooks";
import DataTable from "../../../components/common/DataTable";

// 定义饼图颜色
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function TransactionTab() {
  const [transactions, setTransactions] = useState({
    income: [],
    expense: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    income: { currentPage: 1 },
    expense: { currentPage: 1 },
  });
  const itemsPerPage = 15;

  // 处理月度数据
  const processMonthlyData = () => {
    const last6Months = [];
    const monthlyData = [];

    // 获取最近6个月
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
      });

      const monthIncome = transactions.income
        .filter((t) => {
          const tDate = new Date(t.date);
          return (
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpense = transactions.expense
        .filter((t) => {
          const tDate = new Date(t.date);
          return (
            tDate.getMonth() === date.getMonth() &&
            tDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        name: monthKey,
        Income: monthIncome,
        Expenses: monthExpense,
      });
    }

    return monthlyData;
  };

  // 处理支出类别数据
  const processExpenseCategories = () => {
    const categories = {};
    transactions.expense.forEach((transaction) => {
      const type = transaction.type || "Other";
      categories[type] = (categories[type] || 0) + transaction.amount;
    });

    // 按金额降序排序
    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Fetch transaction data
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getTransactions({ page: 1, perPage: 15 });

      console.log("📥 从后端接收到的交易数据:", JSON.stringify(data, null, 2));
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transaction data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePageChange = (type, pageNumber) => {
    setPagination((prev) => ({
      ...prev,
      [type]: { ...prev[type], currentPage: pageNumber },
    }));
  };

  // Pagination is now handled by the Pagination component from components/public/Pagination.jsx

  const renderTransactionTable = (transactions, type) => {
    if (!transactions || transactions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No {type} transactions found for the selected period
        </div>
      );
    }

    const total = transactions.reduce(
      (sum, t) => sum + (parseFloat(t.amount) || 0),
      0
    );
    const recordCount = transactions.length;

    // Calculate pagination
    const currentPage = pagination[type].currentPage;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransactions = transactions.slice(startIndex, endIndex);

    return (
      <div className="overflow-x-auto">
        <div className="text-sm text-gray-500 mb-2">
          Found {recordCount} records
        </div>
        
        <DataTable
          columns={[
            { 
              key: "date", 
              label: "Date", 
              width: "15%"
            },
            { 
              key: "type", 
              label: "Type", 
              width: "15%"
            },
            { 
              key: "docNum", 
              label: "Doc #", 
              width: "10%",
              render: (row) => row.docNum || "-"
            },
            { 
              key: "name", 
              label: "Name", 
              width: "20%",
              render: (row) => row.name || "-"
            },
            { 
              key: "account", 
              label: "Account", 
              width: "15%",
              render: (row) => row.account || "-"
            },
            { 
              key: "amount", 
              label: "Amount", 
              width: "15%",
              render: (row) => (
                <div className={`text-right ${type === "expense" ? "text-red-600" : "text-green-600"}`}>
                  ${Math.abs(row.amount).toFixed(2)}
                </div>
              )
            },
            { 
              key: "memo", 
              label: "Memo", 
              width: "15%",
              render: (row) => row.memo || "-"
            }
          ]}
          data={currentTransactions}
        />
        
        <div className="bg-gray-50 p-4 flex justify-end items-center">
          <div className="font-medium mr-4">
            Total {type} amount: 
            <span className={`ml-2 ${type === "expense" ? "text-red-600" : "text-green-600"}`}>
              ${Math.abs(total).toFixed(2)}
            </span>
          </div>
        </div>

        <Pagination
          currentPage={pagination[type].currentPage}
          totalPages={Math.ceil(transactions.length / itemsPerPage)}
          onPageChange={(newPage) => handlePageChange(type, newPage)}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">
            Failed to load transaction data
          </p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-full">
        {/* Monthly Income/Expense Chart */}
        <div className="bg-white p-6 rounded-lg shadow overflow-hidden">
          <h2 className="text-lg font-medium mb-4">Monthly Overview</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={processMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10, width: '100%' }}
                  formatter={(value, entry, index) => {
                    return (
                      <span style={{ color: entry.color, wordBreak: 'break-word', width: '100%' }}>
                        {value}
                      </span>
                    );
                  }}
                />
                <Bar dataKey="Income" fill="#4CAF50" />
                <Bar dataKey="Expenses" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories Chart */}
        <div className="bg-white p-6 rounded-lg shadow overflow-hidden">
          <h2 className="text-lg font-medium mb-4">Expense Types</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={processExpenseCategories()}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                    const RADIAN = Math.PI / 180;
                    // 增加半径，让标签显示在扇区外围
                    const radius = outerRadius * 1.1;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    // 将长文本拆分成多行，每行不超过10个字符
                    const words = name.split(' ');
                    let lines = [];
                    let currentLine = '';
                    
                    words.forEach(word => {
                      // 如果当前行加上新词和空格不超过10个字符，则添加到当前行
                      if (currentLine.length + word.length + 1 <= 10) {
                        currentLine += (currentLine ? ' ' : '') + word;
                      } else {
                        // 否则保存当前行并开始新行
                        if (currentLine) lines.push(currentLine);
                        currentLine = word;
                      }
                    });
                    
                    // 添加最后一行
                    if (currentLine) lines.push(currentLine);
                    
                    // 如果没有拆分成行，就用原文本
                    if (lines.length === 0) lines = [name];
                    
                    const percentValue = (percent * 100).toFixed(0);
                    
                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill={COLORS[index % COLORS.length]}
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        style={{ 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white'
                        }}
                      >
                        {lines.map((line, i) => (
                          <tspan 
                            key={i} 
                            x={x} 
                            dy={i === 0 ? 0 : '1.2em'} // 第一行不偏移，后续行偏移1.2em
                          >
                            {line} {i === lines.length - 1 ? `${percentValue}%` : ''}
                          </tspan>
                        ))}
                      </text>
                    );
                  }}
                >
                  {processExpenseCategories().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${value.toFixed(2)}`}
                  labelFormatter={(name) => `Type: ${name}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 10, width: '100%' }}
                  formatter={(value, entry, index) => {
                    return (
                      <span style={{ color: entry.color, wordBreak: 'break-word', width: '100%' }}>
                        {value}
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Category Tabs */}
      <Tab.Group>
        <Tab.List className="flex space-x-4 border-b border-gray-300 max-w-full">
          <Tab
            className={({ selected }) =>
              `px-4 py-2 text-sm font-medium ${
                selected
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            Income
          </Tab>
          <Tab
            className={({ selected }) =>
              `px-4 py-2 text-sm font-medium ${
                selected
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            Expenses
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-4">
          <Tab.Panel>
            {renderTransactionTable(transactions.income, "income")}
          </Tab.Panel>
          <Tab.Panel>
            {renderTransactionTable(transactions.expense, "expense")}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
