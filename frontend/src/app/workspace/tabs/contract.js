"use client";

import React, { useState, useEffect } from 'react';
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
import SortableHeader from '../../../components/SortableHeader';
import useSortable from '../../../hooks/useSortable';

const ContractTab = () => {
  // 状态管理
  const [contractData, setContractData] = useState({
    overview: {
      draftContracts: { count: 0, total: 0, percentage: 0 },
      newBusinesses: { count: 0, total: 0, percentage: 0 },
      ongoingContracts: { count: 0, total: 0, percentage: 0 }
    },
    clientTypes: [],
    locations: [],
    reminders: [],
    topClients: [],
    contracts: []
  });
  
  // 使用排序钩子
  const { sortField, sortDirection, handleSort, sortData } = useSortable('id', 'asc');

  // 加载数据
  useEffect(() => {
    const loadContractData = async () => {
      try {
        const data = await import("../../../../dummy_data/contract.json");
        setContractData(data);
      } catch (error) {
        console.error("Error loading contract data:", error);
      }
    };
    loadContractData();
  }, []);

  // 图表颜色配置
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // 数据处理
  const topClientsChartData = contractData.topClients.map(client => ({
    name: client.name,
    value: client.value
  }));

  const locationChartData = contractData.locations.map(item => ({
    name: item.city,
    value: item.count
  }));

  const clientTypeChartData = contractData.clientTypes.map(item => ({
    name: item.type,
    value: item.value
  }));

  // 标签页状态
  const [activeTab, setActiveTab] = useState('overview');
  
  // 排序合同数据
  const sortedContracts = sortData(contractData.contracts);

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
              onClick={() => setActiveTab('contracts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contracts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contracts
            </button>
          </nav>
        </div>
      </div>

      {/* 概览页面 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaFileContract className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Draft Contracts</h3>
                  <div className="mt-1">
                    <span className="text-2xl font-semibold">{contractData.overview.draftContracts.count}</span>
                    <span className="ml-2 text-sm text-gray-500">({contractData.overview.draftContracts.percentage}%)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaBuilding className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">New Businesses</h3>
                  <div className="mt-1">
                    <span className="text-2xl font-semibold">{contractData.overview.newBusinesses.count}</span>
                    <span className="ml-2 text-sm text-gray-500">({contractData.overview.newBusinesses.percentage}%)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaChartPie className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Ongoing Contracts</h3>
                  <div className="mt-1">
                    <span className="text-2xl font-semibold">{contractData.overview.ongoingContracts.count}</span>
                    <span className="ml-2 text-sm text-gray-500">({contractData.overview.ongoingContracts.percentage}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 客户类型分布 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Client Type Distribution</h3>
              <div className="h-80">
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

            {/* 客户地址分布 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Client Location Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 提醒和最高价值客户 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 合同到期提醒 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Contract Expiry Reminders</h3>
                <FaBell className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {contractData.reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{reminder.client}</span>
                    <span className="text-sm text-red-600">{reminder.expiryDate}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 最高价值客户 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Top Value Clients</h3>
                <FaDollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {contractData.topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{client.name}</span>
                    <span className="text-sm font-medium">${client.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 合同列表页面 */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-lg shadow">
          {/* 搜索栏 */}
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contracts..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* 合同表格 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortableHeader 
                      label="ID" 
                      field="id" 
                      currentSortField={sortField} 
                      sortDirection={sortDirection} 
                      onSort={handleSort} 
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortableHeader 
                      label="Subject" 
                      field="subject" 
                      currentSortField={sortField} 
                      sortDirection={sortDirection} 
                      onSort={handleSort} 
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortableHeader 
                      label="Client" 
                      field="client" 
                      currentSortField={sortField} 
                      sortDirection={sortDirection} 
                      onSort={handleSort} 
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortableHeader 
                      label="Start Date" 
                      field="startDate" 
                      currentSortField={sortField} 
                      sortDirection={sortDirection} 
                      onSort={handleSort} 
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortableHeader 
                      label="End Date" 
                      field="endDate" 
                      currentSortField={sortField} 
                      sortDirection={sortDirection} 
                      onSort={handleSort} 
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{contract.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.startDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contract.endDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        contract.status === 'Accept' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTab;
