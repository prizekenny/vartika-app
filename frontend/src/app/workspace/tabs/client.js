"use client";

import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaBuilding } from 'react-icons/fa';

const ClientTab = () => {
  const [clients, setClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  // 處理編輯客戶資料
  const handleEdit = (client) => {
    setEditingClient({ ...client });
    setIsEditModalOpen(true);
  };

  // 處理保存編輯
  const handleSaveEdit = () => {
    setClients(clients.map(client => 
      client.id === editingClient.id ? editingClient : client
    ));
    setIsEditModalOpen(false);
    setEditingClient(null);
  };

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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
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
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 編輯模態框 */}
      {isEditModalOpen && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">Edit Client Data</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={editingClient.type}
                  onChange={(e) => setEditingClient({...editingClient, type: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Individual">Individual</option>
                  <option value="Company">Company</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact</label>
                <input
                  type="text"
                  value={editingClient.contact}
                  onChange={(e) => setEditingClient({...editingClient, contact: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={editingClient.phone}
                  onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={editingClient.address}
                  onChange={(e) => setEditingClient({...editingClient, address: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Open Time</label>
                <input
                  type="text"
                  value={editingClient.openTime}
                  onChange={(e) => setEditingClient({...editingClient, openTime: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editingClient.status}
                  onChange={(e) => setEditingClient({...editingClient, status: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remark</label>
                <textarea
                  value={editingClient.remark}
                  onChange={(e) => setEditingClient({...editingClient, remark: e.target.value})}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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
