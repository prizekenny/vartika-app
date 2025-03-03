"use client";

import React, { useState, useEffect } from 'react';

const InvoiceTab = () => {
  const [invoiceData, setInvoiceData] = useState({
    statistics: {
      unpaidTotal: "$0",
      last30DaysReceived: "$0"
    },
    invoices: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 每页显示10条记录
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  useEffect(() => {
    // 加载测试数据
    const loadDummyData = async () => {
      try {
        const data = await import("../../../../dummy_data/invoice.json");
        setInvoiceData(data);
      } catch (error) {
        console.error("Error loading invoice data:", error);
      }
    };
    loadDummyData();
  }, []);

  const getStatusColor = (statusType) => {
    switch (statusType) {
      case 'overdue':
        return 'text-red-500 bg-red-50';
      case 'paid':
        return 'text-green-500 bg-green-50';
      case 'pending':
        return 'text-yellow-500 bg-yellow-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  // 处理全选/取消全选
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInvoices(invoiceData.invoices.map(invoice => invoice.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  // 处理单个选择
  const handleSelect = (id) => {
    setSelectedInvoices(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 处理批量操作
  const handleBatchAction = () => {
    if (!selectedBatch) return;
    
    console.log(`Performing ${selectedBatch} on invoices:`, selectedInvoices);
    // 这里添加实际的批量操作逻辑
  };

  // 计算总页数
  const totalPages = Math.ceil(invoiceData.invoices.length / itemsPerPage);

  // 获取当前页的数据
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return invoiceData.invoices.slice(startIndex, endIndex);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>
      
      {/* 统计信息 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Unpaid Total</h3>
              <p className="text-3xl font-bold text-gray-800">{invoiceData.statistics.unpaidTotal}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-red-500 text-sm font-medium">Needs attention</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Received (Last 30 Days)</h3>
              <p className="text-3xl font-bold text-gray-800">{invoiceData.statistics.last30DaysReceived}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-green-500 text-sm font-medium">On track</span>
          </div>
        </div>
      </div>

      {/* 过滤器和操作按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <select 
            className="border rounded-md px-4 py-2"
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              if (e.target.value) handleBatchAction();
            }}
          >
            <option value="">Batch actions</option>
            <option value="export">Export Selected</option>
            <option value="delete">Delete Selected</option>
          </select>
          
          <select 
            className="border rounded-md px-4 py-2"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Status: All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>

          <input 
            type="date" 
            className="border rounded-md px-4 py-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Create Invoice
        </button>
      </div>

      {/* 发票表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedInvoices.length === invoiceData.invoices.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {getCurrentPageData().map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedInvoices.includes(invoice.id)}
                    onChange={() => handleSelect(invoice.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.number}</td>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap">{invoice.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(invoice.statusType)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-500 hover:text-blue-700 mr-3">Edit</button>
                  <button className="text-gray-500 hover:text-gray-700">Print</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex justify-center items-center space-x-2">
        <button 
          className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {/* 页码按钮 */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`px-3 py-1 border rounded-md ${
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
        <button 
          className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default InvoiceTab;
