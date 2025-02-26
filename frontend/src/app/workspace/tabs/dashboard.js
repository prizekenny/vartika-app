"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaStar, 
  FaRegStar,
  FaTimes,
  FaChartBar,
  FaListUl,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign,
  FaPercentage,
  FaCheck,
  FaRegSquare
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
  // 状态管理
  const [todos, setTodos] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [marketShareData, setMarketShareData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [financialMetrics, setFinancialMetrics] = useState({});
  const [COLORS, setCOLORS] = useState([]);
  const [activeTab, setActiveTab] = useState('todo');
  const [newTaskText, setNewTaskText] = useState('');
  const [showNewTaskInput, setShowNewTaskInput] = useState(false);

  // 加载仪表板数据
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await import("../../../../dummy_data/dashboard.json");
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

  // Toggle task completion status
  const toggleComplete = (id) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    }));
  };

  // Add new task
  const addNewTask = () => {
    if (newTaskText.trim() !== '') {
      const newTask = {
        id: Date.now(), // 使用时间戳作为临时ID
        text: newTaskText,
        starred: false,
        completed: false
      };
      setTodos([...todos, newTask]);
      setNewTaskText('');
      setShowNewTaskInput(false);
    }
  };

  // Handle key press in new task input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addNewTask();
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Tasks</h3>
              <button
                onClick={() => setShowNewTaskInput(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Add New Task
              </button>
            </div>
            
            {showNewTaskInput && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter new task..."
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={addNewTask}
                    className="ml-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowNewTaskInput(false);
                      setNewTaskText('');
                    }}
                    className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {todos.map(todo => (
                <div key={todo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleComplete(todo.id)}
                      className={`mr-3 text-lg ${todo.completed ? 'text-green-500' : 'text-gray-400'}`}
                    >
                      {todo.completed ? <FaCheck /> : <FaRegSquare />}
                    </button>
                    <span className={`flex-grow ${todo.completed ? 'line-through text-gray-400' : ''}`}>{todo.text}</span>
                  </div>
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
                  <div className={`flex items-center ${financialMetrics.revenue?.positive ? 'text-green-500' : 'text-red-500'}`}>
                    <span className="text-sm">{financialMetrics.revenue?.change}</span>
                    {financialMetrics.revenue?.positive ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />}
                  </div>
                </div>
                <h4 className="text-gray-600 mt-2">Revenue</h4>
                <p className="text-2xl font-bold text-gray-800">{financialMetrics.revenue?.value}</p>
              </div>

              {/* Expenses Card */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-red-600">
                    <FaDollarSign className="text-2xl" />
                  </div>
                  <div className={`flex items-center ${financialMetrics.expenses?.positive ? 'text-green-500' : 'text-red-500'}`}>
                    <span className="text-sm">{financialMetrics.expenses?.change}</span>
                    {financialMetrics.expenses?.positive ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />}
                  </div>
                </div>
                <h4 className="text-gray-600 mt-2">Expenses</h4>
                <p className="text-2xl font-bold text-gray-800">{financialMetrics.expenses?.value}</p>
              </div>

              {/* Profit Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-green-600">
                    <FaDollarSign className="text-2xl" />
                  </div>
                  <div className={`flex items-center ${financialMetrics.profit?.positive ? 'text-green-500' : 'text-red-500'}`}>
                    <span className="text-sm">{financialMetrics.profit?.change}</span>
                    {financialMetrics.profit?.positive ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />}
                  </div>
                </div>
                <h4 className="text-gray-600 mt-2">Net Profit</h4>
                <p className="text-2xl font-bold text-gray-800">{financialMetrics.profit?.value}</p>
              </div>

              {/* Margin Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-purple-600">
                    <FaPercentage className="text-2xl" />
                  </div>
                  <div className={`flex items-center ${financialMetrics.margin?.positive ? 'text-green-500' : 'text-red-500'}`}>
                    <span className="text-sm">{financialMetrics.margin?.change}</span>
                    {financialMetrics.margin?.positive ? <FaArrowUp className="ml-1" /> : <FaArrowDown className="ml-1" />}
                  </div>
                </div>
                <h4 className="text-gray-600 mt-2">Profit Margin</h4>
                <p className="text-2xl font-bold text-gray-800">{financialMetrics.margin?.value}</p>
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
