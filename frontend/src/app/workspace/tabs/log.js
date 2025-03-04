"use client";

import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import SortableHeader from '../../../components/SortableHeader';
import useSortable from '../../../hooks/useSortable';

const LogTab = () => {
  // 状态管理
  const [logs, setLogs] = useState([]);
  const [logTypes, setLogTypes] = useState([]);
  const [statusTypes, setStatusTypes] = useState([]);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const logsPerPage = 7;
  
  // 使用排序钩子
  const { sortField, sortDirection, handleSort, sortData } = useSortable('timestamp', 'desc');

  // 加载日志数据
  useEffect(() => {
    const loadLogData = async () => {
      try {
        const data = await import("../../../../dummy_data/log.json");
        setLogs(data.logs);
        setLogTypes(data.logTypes);
        setStatusTypes(data.statusTypes);
      } catch (error) {
        console.error("Error loading log data:", error);
        setLogs([]);
        setLogTypes([]);
        setStatusTypes([]);
      }
    };
    loadLogData();
  }, []);

  // 处理全选
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    setSelectedLogs(e.target.checked ? currentLogs.map(log => log.id) : []);
  };

  // 处理单个选择
  const handleSelect = (logId) => {
    setSelectedLogs(prev => {
      if (prev.includes(logId)) {
        return prev.filter(id => id !== logId);
      } else {
        return [...prev, logId];
      }
    });
  };

  // 过滤日志
  const filteredLogs = logs.filter(log => 
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 使用钩子提供的排序函数
  const sortedLogs = sortData(filteredLogs, (a, b, field, direction) => {
    const dir = direction === 'asc' ? 1 : -1;
    if (field === 'timestamp') {
      return dir * (new Date(a.timestamp) - new Date(b.timestamp));
    }
    return dir * (a[field] < b[field] ? -1 : 1);
  });

  // 分页
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = sortedLogs.slice(indexOfFirstLog, indexOfLastLog);
  const pageCount = Math.ceil(sortedLogs.length / logsPerPage);

  // 获取状态样式
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* 标题和操作栏 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Activity Logs</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search logs..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <FaFilter className="mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <FaDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* 日志表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader
                  label="Timestamp"
                  field="timestamp"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader
                  label="Activity Name and Description"
                  field="name"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader
                  label="Type"
                  field="type"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader
                  label="Status"
                  field="status"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader
                  label="User"
                  field="user"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedLogs.includes(log.id)}
                    onChange={() => handleSelect(log.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{log.name}</div>
                  <div className="text-sm text-gray-500">{log.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {log.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(log.status)}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.user}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页和排序 */}
      <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
        <div className="flex items-center text-sm text-gray-700">
          <span>Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, sortedLogs.length)} of {sortedLogs.length} entries</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded-lg ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
            disabled={currentPage === pageCount}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogTab;