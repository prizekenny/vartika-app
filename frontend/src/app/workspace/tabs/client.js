"use client";

import React, { useState } from 'react';
import { FaSearch, FaUser, FaBuilding } from 'react-icons/fa';

const ClientTab = () => {
  // 模拟客户数据
  const [clients] = useState([
    {
      id: 'CL001',
      name: 'John Smith',
      type: 'Individual',
      contact: 'john.smith@email.com',
      address: '123 Maple Street, Toronto, ON',
      phone: '+1 (416) 555-0123',
      openTime: '2024-01-15',
      status: 'active',
      remark: 'Premium client'
    },
    {
      id: 'CL002',
      name: 'Tech Solutions Inc',
      type: 'Company',
      contact: 'info@techsolutions.com',
      address: '456 Oak Avenue, Vancouver, BC',
      phone: '+1 (604) 555-0456',
      openTime: '2024-02-01',
      status: 'active',
      remark: 'Enterprise account'
    },
    {
      id: 'CL003',
      name: 'Sarah Johnson',
      type: 'Individual',
      contact: 'sarah.j@email.com',
      address: '789 Pine Road, Montreal, QC',
      phone: '+1 (514) 555-0789',
      openTime: '2024-01-20',
      status: 'inactive',
      remark: 'Seasonal client'
    },
    {
      id: 'CL004',
      name: 'Global Traders Ltd',
      type: 'Company',
      contact: 'contact@globaltraders.com',
      address: '321 Elm Drive, Calgary, AB',
      phone: '+1 (403) 555-0321',
      openTime: '2024-02-15',
      status: 'active',
      remark: 'International business'
    },
    {
      id: 'CL005',
      name: 'Michael Chen',
      type: 'Individual',
      contact: 'm.chen@email.com',
      address: '654 Birch Lane, Ottawa, ON',
      phone: '+1 (613) 555-0654',
      openTime: '2024-01-25',
      status: 'active',
      remark: 'Regular client'
    },
    {
      id: 'CL006',
      name: 'Digital Dynamics',
      type: 'Company',
      contact: 'info@digitaldynamics.com',
      address: '987 Cedar Court, Edmonton, AB',
      phone: '+1 (780) 555-0987',
      openTime: '2024-02-10',
      status: 'active',
      remark: 'Tech startup'
    },
    {
      id: 'CL007',
      name: 'Emma Wilson',
      type: 'Individual',
      contact: 'emma.w@email.com',
      address: '147 Spruce Way, Victoria, BC',
      phone: '+1 (250) 555-0147',
      openTime: '2024-01-30',
      status: 'inactive',
      remark: 'Part-time service'
    },
    {
      id: 'CL008',
      name: 'Nova Industries',
      type: 'Company',
      contact: 'support@novaindustries.com',
      address: '258 Willow Street, Halifax, NS',
      phone: '+1 (902) 555-0258',
      openTime: '2024-02-20',
      status: 'active',
      remark: 'Manufacturing partner'
    },
    {
      id: 'CL009',
      name: 'Robert Taylor',
      type: 'Individual',
      contact: 'rob.t@email.com',
      address: '369 Oak Circle, Winnipeg, MB',
      phone: '+1 (204) 555-0369',
      openTime: '2024-01-22',
      status: 'active',
      remark: 'VIP client'
    },
    {
      id: 'CL010',
      name: 'Eco Solutions Corp',
      type: 'Company',
      contact: 'info@ecosolutions.com',
      address: '741 Pine Avenue, Quebec City, QC',
      phone: '+1 (418) 555-0741',
      openTime: '2024-02-05',
      status: 'active',
      remark: 'Green initiative partner'
    },
    {
      id: 'CL011',
      name: 'Kevin White',
      type: 'Individual',
      contact: 'kevin.w@email.com',
      address: '852 Maple Street, Toronto, ON',
      phone: '+1 (416) 555-0852',
      openTime: '2024-01-18',
      status: 'active',
      remark: 'New client'
    },
    {
      id: 'CL012',
      name: 'Green Energy Inc',
      type: 'Company',
      contact: 'info@greenenergy.com',
      address: '963 Oak Avenue, Vancouver, BC',
      phone: '+1 (604) 555-0963',
      openTime: '2024-02-12',
      status: 'active',
      remark: 'Renewable energy partner'
    },
    {
      id: 'CL013',
      name: 'Olivia Lee',
      type: 'Individual',
      contact: 'olivia.l@email.com',
      address: '654 Pine Road, Montreal, QC',
      phone: '+1 (514) 555-0654',
      openTime: '2024-01-28',
      status: 'inactive',
      remark: 'Part-time client'
    },
    {
      id: 'CL014',
      name: 'Smart Home Solutions',
      type: 'Company',
      contact: 'support@smarthomesolutions.com',
      address: '321 Cedar Court, Calgary, AB',
      phone: '+1 (403) 555-0321',
      openTime: '2024-02-22',
      status: 'active',
      remark: 'Home automation partner'
    },
    {
      id: 'CL015',
      name: 'Ava Kim',
      type: 'Individual',
      contact: 'ava.k@email.com',
      address: '987 Spruce Way, Ottawa, ON',
      phone: '+1 (613) 555-0987',
      openTime: '2024-01-25',
      status: 'active',
      remark: 'Regular client'
    },
    {
      id: 'CL016',
      name: 'Innovatech Inc',
      type: 'Company',
      contact: 'info@innovatech.com',
      address: '741 Willow Street, Edmonton, AB',
      phone: '+1 (780) 555-0741',
      openTime: '2024-02-15',
      status: 'active',
      remark: 'Tech innovation partner'
    },
    {
      id: 'CL017',
      name: 'Liam Brown',
      type: 'Individual',
      contact: 'liam.b@email.com',
      address: '369 Oak Circle, Winnipeg, MB',
      phone: '+1 (204) 555-0369',
      openTime: '2024-01-20',
      status: 'active',
      remark: 'New client'
    },
    {
      id: 'CL018',
      name: 'Eco Friendly Products',
      type: 'Company',
      contact: 'info@ecofriendlyproducts.com',
      address: '852 Maple Street, Toronto, ON',
      phone: '+1 (416) 555-0852',
      openTime: '2024-02-10',
      status: 'active',
      remark: 'Sustainable products partner'
    },
    {
      id: 'CL019',
      name: 'Noah Davis',
      type: 'Individual',
      contact: 'noah.d@email.com',
      address: '963 Oak Avenue, Vancouver, BC',
      phone: '+1 (604) 555-0963',
      openTime: '2024-01-22',
      status: 'inactive',
      remark: 'Part-time client'
    },
    {
      id: 'CL020',
      name: 'Green Planet Inc',
      type: 'Company',
      contact: 'info@greenplanet.com',
      address: '654 Pine Road, Montreal, QC',
      phone: '+1 (514) 555-0654',
      openTime: '2024-02-20',
      status: 'active',
      remark: 'Environmental partner'
    }
  ]);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 搜索状态
  const [searchTerm, setSearchTerm] = useState('');

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
              {clients.map((client) => (
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
          <span>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, clients.length)} of {clients.length} entries</span>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          {[...Array(Math.ceil(clients.length / itemsPerPage))].map((_, i) => (
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
            disabled={currentPage === Math.ceil(clients.length / itemsPerPage)}
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
