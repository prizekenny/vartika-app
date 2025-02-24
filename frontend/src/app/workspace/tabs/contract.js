"use client";

import React, { useState } from 'react';
import { FaFileContract, FaBuilding, FaChartPie, FaMapMarkerAlt, FaBell, FaDollarSign, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
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
  ResponsiveContainer
} from 'recharts';

const ContractTab = () => {
  // 模拟数据 - 概览数据
  const overviewData = {
    draftContracts: {
      count: 45,
      total: 320,
      percentage: 14.06
    },
    newBusinesses: {
      count: 28,
      total: 320,
      percentage: 8.75
    },
    ongoingContracts: {
      count: 247,
      total: 320,
      percentage: 77.19
    }
  };

  // 模拟数据 - 客户类型分布
  const clientTypeData = [
    { type: 'Advisory', value: 35 },
    { type: 'Other Individuals', value: 25 },
    { type: 'SMEs', value: 30 },
    { type: 'Self-employed', value: 10 }
  ];

  // 模拟数据 - 客户地址分布
  const locationData = [
    { city: 'Toronto', count: 120 },
    { city: 'Vancouver', count: 85 },
    { city: 'Montreal', count: 65 },
    { city: 'Calgary', count: 50 }
  ];

  // 模拟数据 - 合同到期提醒
  const contractReminders = [
    { client: 'Tech Solutions Inc', expiryDate: '2025-03-15' },
    { client: 'Global Trading Ltd', expiryDate: '2025-03-20' },
    { client: 'Sarah Johnson', expiryDate: '2025-03-25' },
    { client: 'Eco Friendly Corp', expiryDate: '2025-03-30' },
    { client: 'Digital Dynamics', expiryDate: '2025-04-05' }
  ];

  // 模拟数据 - 最高价值客户
  const topClients = [
    { name: 'Tech Solutions Inc', value: 150000 },
    { name: 'Global Trading Ltd', value: 120000 },
    { name: 'Eco Friendly Corp', value: 100000 },
    { name: 'Digital Dynamics', value: 85000 },
    { name: 'Smart Systems Co', value: 75000 },
    { name: 'Green Energy Inc', value: 65000 }
  ];

  // 模拟数据 - 合同管理列表
  const contracts = [
    {
      id: 'CT001',
      subject: 'Accounting Agreement',
      client: 'Tech Solutions Inc',
      startDate: '2024-01-01',
      endDate: '2025-12-31',
      status: 'Accept'
    },
    {
      id: 'CT002',
      subject: 'Tax Services Contract',
      client: 'Global Trading Ltd',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      status: 'Pending'
    },
    {
      id: 'CT003',
      subject: 'Bookkeeping Contract',
      client: 'Sarah Johnson',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      status: 'Accept'
    },
    {
      id: 'CT004',
      subject: 'Advisory Services',
      client: 'Eco Friendly Corp',
      startDate: '2024-02-15',
      endDate: '2025-02-14',
      status: 'Pending'
    },
    {
      id: 'CT005',
      subject: 'Tax Planning Agreement',
      client: 'Digital Dynamics',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      status: 'Accept'
    },
    {
      id: 'CT006',
      subject: 'Financial Consulting',
      client: 'Smart Systems Co',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      status: 'Accept'
    },
    {
      id: 'CT007',
      subject: 'Audit Services',
      client: 'Green Energy Inc',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      status: 'Pending'
    },
    {
      id: 'CT008',
      subject: 'Tax Compliance',
      client: 'Nova Industries',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'Accept'
    },
    {
      id: 'CT009',
      subject: 'Financial Statements',
      client: 'Blue Ocean Ltd',
      startDate: '2024-03-15',
      endDate: '2025-03-14',
      status: 'Pending'
    },
    {
      id: 'CT010',
      subject: 'Business Advisory',
      client: 'Peak Performance Co',
      startDate: '2024-02-15',
      endDate: '2025-02-14',
      status: 'Accept'
    }
  ];

  // 客户类型分布图配置
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // 最高价值客户数据处理
  const topClientsChartData = topClients.map(client => ({
    name: client.name,
    value: client.value
  }));

  // 客户地址分布数据处理
  const locationChartData = locationData.map(item => ({
    name: item.city,
    value: item.count
  }));

  // 客户类型分布数据处理
  const clientTypeChartData = clientTypeData.map(item => ({
    name: item.type,
    value: item.value
  }));

  // 标签页状态
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6">
      {/* 标题 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Contract Management</h2>
      </div>

      {/* 标签页 */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Contract
            </button>
          </nav>
        </div>
      </div>

      {/* Overview 内容 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 第一行统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Draft Contracts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Contracts Under Draft Status</p>
                  <p className="mt-2 text-3xl font-semibold">{overviewData.draftContracts.count}</p>
                  <p className="mt-1 text-sm text-gray-600">{overviewData.draftContracts.percentage}% of total</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaFileContract className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* New Businesses */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New Businesses</p>
                  <p className="mt-2 text-3xl font-semibold">{overviewData.newBusinesses.count}</p>
                  <p className="mt-1 text-sm text-gray-600">{overviewData.newBusinesses.percentage}% of total</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaBuilding className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Ongoing Contracts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ongoing Contracts</p>
                  <p className="mt-2 text-3xl font-semibold">{overviewData.ongoingContracts.count}</p>
                  <p className="mt-1 text-sm text-gray-600">{overviewData.ongoingContracts.percentage}% of total</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaChartPie className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* 第二行图表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 客户类型分布图 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Client Type Distribution</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientTypeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {clientTypeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 地址分布图 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Client Location Distribution</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Clients" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 第三行列表和图表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 合同到期提醒 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Contract Reminders</h3>
              <div className="mt-4">
                <div className="space-y-4">
                  {contractReminders.map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaBell className="text-yellow-500 mr-2" />
                        <span className="text-sm text-gray-600">{reminder.client}</span>
                      </div>
                      <span className="text-sm text-red-500">{reminder.expiryDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 最高价值客户 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Top Value Clients</h3>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topClientsChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topClientsChartData.map((entry, index) => (
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
        </div>
      )}

      {/* Manage Contract 内容 */}
      {activeTab === 'manage' && (
        <div className="bg-white rounded-lg shadow">
          {/* 表格工具栏 */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">Total Contracts:</span>
              <span className="text-sm font-semibold text-gray-900">{contracts.length}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search contracts..."
                  className="pl-8 pr-4 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-sm" />
              </div>
              <select className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="all">All Status</option>
                <option value="accept">Accept</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Contract #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">{contract.id}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-600">{contract.subject}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-600">{contract.client}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-600">{contract.startDate}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-600">{contract.endDate}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contract.status === 'Accept' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex justify-center space-x-3">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页控件 */}
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">{contracts.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    2
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    3
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTab;
