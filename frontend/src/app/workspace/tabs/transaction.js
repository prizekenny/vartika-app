"use client";

import React, { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
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

  const renderPagination = (type, totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = pagination[type].currentPage;

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => handlePageChange(type, currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentPage === 1
                ? "text-gray-400 bg-gray-100"
                : "text-gray-700 bg-white hover:bg-gray-50"
            } border border-gray-300`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(type, currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? "text-gray-400 bg-gray-100"
                : "text-gray-700 bg-white hover:bg-gray-50"
            } border border-gray-300`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handlePageChange(type, currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                } border-gray-300`}
              >
                <span className="sr-only">Previous</span>
                <FaChevronLeft className="h-4 w-4" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(type, i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    currentPage === i + 1
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(type, currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                } border-gray-300`}
              >
                <span className="sr-only">Next</span>
                <FaChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Doc #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Account
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Memo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTransactions.map((transaction, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.docNum || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.account || "-"}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                    type === "expense" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ${Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.memo || "-"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td
                colSpan="5"
                className="px-6 py-4 text-sm font-medium text-gray-900"
              >
                Total {type} amount:
              </td>
              <td
                className={`px-6 py-4 text-sm font-medium text-right ${
                  type === "expense" ? "text-red-600" : "text-green-600"
                }`}
              >
                ${Math.abs(total).toFixed(2)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        {renderPagination(type, transactions.length)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Monthly Income/Expense Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Monthly Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="Income" fill="#4CAF50" />
                <Bar dataKey="Expenses" fill="#f44336" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Expense Types</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processExpenseCategories()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
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
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Category Tabs */}
      <Tab.Group>
        <Tab.List className="flex space-x-4 border-b border-gray-300">
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
