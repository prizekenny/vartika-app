"use client";

import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AssignmentTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await import("../../../../dummy_data/assignment.json");
        setAssignments(response.assignments);
      } catch (error) {
        console.error("Error loading assignments:", error);
      }
    };
    loadAssignments();
  }, []);

  // 过滤和分页
  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = statusFilter === 'All' || assignment.status === statusFilter;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || assignment.dueDate.includes(dateFilter);
    return matchesStatus && matchesSearch && matchesDate;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-6">
      {/* 标题 */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Assignments</h2>

      {/* 过滤和操作栏 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
            <FaPlus className="mr-2" />
            Create
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-medium">
          <div>Assignment</div>
          <div>Status</div>
          <div>Due Date</div>
          <div>Create Time</div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {currentAssignments.map((assignment) => (
            <div
              key={assignment.id}
              onClick={() => setSelectedAssignment(assignment)}
              className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div>
                <div className="text-lg font-medium">{assignment.title}</div>
                <div className="text-sm text-gray-500">{assignment.assignee}</div>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  assignment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {assignment.status}
                </span>
              </div>
              <div>{new Date(assignment.dueDate).toLocaleDateString()}</div>
              <div>{new Date(assignment.createTime).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 选中任务详情 */}
      {selectedAssignment && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium mb-2">Work Assignment</h3>
          <p className="text-gray-600">{selectedAssignment.description}</p>
        </div>
      )}

      {/* 分页 */}
      {filteredAssignments.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAssignments.length)} of {filteredAssignments.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <FaChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentTab;
