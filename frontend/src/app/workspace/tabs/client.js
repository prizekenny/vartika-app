"use client";

import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaBuilding } from 'react-icons/fa';

const ClientTab = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // 加载测试数据
    const loadDummyData = async () => {
      try {
        const data = await import("../../../../dummy_data/client.json");
        setClients(data.clients);
      } catch (error) {
        console.error("Error loading client data:", error);
        setClients([]);
      }
    };
    loadDummyData();
  }, []);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 搜索状态
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤客户列表
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contact.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    // 这里可以添加更多搜索逻辑
    console.log('Searching for:', searchTerm);
  };

  // 处理分页
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-[1400px] mx-auto p-4">
      {/* 标题 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Clients</h2>
      </div>

      {/* 搜索栏 */}
      <div className="mb-4">
        <form onSubmit={handleSearch} className="flex items-center max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 text-sm border rounded-l-lg focus:outline-none focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-r-lg hover:bg-blue-600 focus:outline-none"
          >
            Search
          </button>
        </form>
      </div>

      {/* 客户表格 */}
      <div className="h-[calc(100vh-220px)] overflow-auto bg-white rounded-lg shadow">
        <div className="min-w-max">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Open Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {client.type === 'Individual' ? (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUser className="text-blue-500 w-4 h-4" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <FaBuilding className="text-green-500 w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.type === 'Individual' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {client.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">{client.id}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">{client.contact}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">{client.address}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">{client.openTime}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">{client.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
        <div className="flex items-center text-sm text-gray-700">
          <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} entries</span>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          {[...Array(Math.ceil(filteredClients.length / itemsPerPage))].map((_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`px-2 py-1 border rounded text-sm ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredClients.length / itemsPerPage)}
            className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientTab;
