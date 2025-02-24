"use client";

import React, { useState } from 'react';
import { 
  FaStar, 
  FaRegStar,
  FaTimes,
  FaChartBar,
  FaListUl,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign,
  FaPercentage
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DashboardTab = () => {
  // Mock todo data
  const initialTodos = [
    { id: 1, text: "Complete Q1 Financial Report", starred: false },
    { id: 2, text: "Prepare Board Meeting Materials", starred: true },
    { id: 3, text: "Review Project Budget Proposal", starred: false },
    { id: 4, text: "Update Business Development Plan", starred: false },
    { id: 5, text: "Quarterly Investor Communication", starred: true },
    { id: 6, text: "Evaluate Market Opportunities", starred: false },
  ];

  // Mock financial data
  const revenueData = [
    { month: 'Jan', revenue: 4000, expenses: 2400 },
    { month: 'Feb', revenue: 3000, expenses: 1398 },
    { month: 'Mar', revenue: 2000, expenses: 9800 },
    { month: 'Apr', revenue: 2780, expenses: 3908 },
    { month: 'May', revenue: 1890, expenses: 4800 },
    { month: 'Jun', revenue: 2390, expenses: 3800 },
  ];

  const marketShareData = [
    { name: 'Product A', value: 400 },
    { name: 'Product B', value: 300 },
    { name: 'Product C', value: 300 },
    { name: 'Product D', value: 200 },
  ];

  const growthData = [
    { month: 'Jan', growth: 20 },
    { month: 'Feb', growth: 35 },
    { month: 'Mar', growth: 25 },
    { month: 'Apr', growth: 45 },
    { month: 'May', growth: 40 },
    { month: 'Jun', growth: 50 },
  ];

  const expenseBreakdown = [
    { name: 'Operations', value: 35 },
    { name: 'Marketing', value: 25 },
    { name: 'R&D', value: 20 },
    { name: 'Admin', value: 20 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const [todos, setTodos] = useState(initialTodos);
  const [activeTab, setActiveTab] = useState('todo');

  // Toggle task star status
  const toggleStar = (id) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, starred: !todo.starred };
      }
      return todo;
    }).sort((a, b) => {
      // Starred tasks first
      if (a.starred === b.starred) return 0;
      return a.starred ? -1 : 1;
    }));
  };

  // Delete task
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Mock financial metrics
  const financialMetrics = {
    revenue: {
      value: '$2.4M',
      change: '+12.5%',
      positive: true
    },
    expenses: {
      value: '$1.1M',
      change: '-5.2%',
      positive: true
    },
    profit: {
      value: '$1.3M',
      change: '+15.8%',
      positive: true
    },
    margin: {
      value: '54.2%',
      change: '+3.2%',
      positive: true
    }
  };

  return (
    <div className="p-6">
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      {/* Navigation */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'todo' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('todo')}
        >
          <FaListUl className="inline mr-2" />
          To-do List
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'financial' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'}`}
          onClick={() => setActiveTab('financial')}
        >
          <FaChartBar className="inline mr-2" />
          Financial Summary
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'todo' ? (
          // To-do List
          <div>
            <h3 className="text-xl font-semibold mb-4">Tasks</h3>
            <div className="space-y-3">
              {todos.map(todo => (
                <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="flex-grow">{todo.text}</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleStar(todo.id)}
                      className={`${todo.starred ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-500`}
                    >
                      {todo.starred ? <FaStar /> : <FaRegStar />}
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Financial Summary
          <div>
            <h3 className="text-xl font-semibold mb-6">Financial Overview</h3>
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Revenue Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-blue-600">
                    <FaDollarSign className="text-2xl" />
                  </div>
                  <div className={`flex items-center ${financialMetrics.revenue.positive ? 'text-green-500' : 'text-red-500'}`}>
                    <span className="text-sm">{financialMetrics.revenue.change}</span>
                    {financialMetrics.revenue.positive ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />}
                  </div>
                </div>
                <h4 className="text-gray-600 mt-2">Revenue</h4>
                <p className="text-2xl font-bold text-gray-800">{financialMetrics.revenue.value}</p>
              </div>

              {/* Expenses Card */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-red-600">
                    <FaDollarSign className="text-2xl" />
                  </div>
                  <div className={`flex items-center ${financialMetrics.expenses.positive ? 'text-green-500' : 'text-red-500'}`}>
                    <span className="text-sm">{financialMetrics.expenses.change}</span>
                    {financialMetrics.expenses.positive ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />}
                  </div>
                </div>
                <h4 className="text-gray-600 mt-2">Expenses</h4>
                <p className="text-2xl font-bold text-gray-800">{financialMetrics.expenses.value}</p>
              </div>

              {/* Profit Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-green-600">
                    <FaDollarSign className="text-2xl" />
                  </div>
                  <div className={`flex items-center ${financialMetrics.profit.positive ? 'text-green-500' : 'text-red-500'}`}>
                    <span className="text-sm">{financialMetrics.profit.change}</span>
                    {financialMetrics.profit.positive ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />}
                  </div>
                </div>
                <h4 className="text-gray-600 mt-2">Net Profit</h4>
                <p className="text-2xl font-bold text-gray-800">{financialMetrics.profit.value}</p>
              </div>

              {/* Margin Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-purple-600">
                    <FaPercentage className="text-2xl" />
                  </div>
                  <div className={`flex items-center ${financialMetrics.margin.positive ? 'text-green-500' : 'text-red-500'}`}>
                    <span className="text-sm">{financialMetrics.margin.change}</span>
                    {financialMetrics.margin.positive ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />}
                  </div>
                </div>
                <h4 className="text-gray-600 mt-2">Profit Margin</h4>
                <p className="text-2xl font-bold text-gray-800">{financialMetrics.margin.value}</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Revenue vs Expenses Chart */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-medium mb-4">Revenue vs Expenses</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
                    <Bar dataKey="expenses" name="Expenses" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Market Share Chart */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-medium mb-4">Market Share</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={marketShareData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {marketShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Growth Trends */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-medium mb-4">Growth Trends</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="growth" name="Growth %" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="text-lg font-medium mb-4">Expense Breakdown</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;
