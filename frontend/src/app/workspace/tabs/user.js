"use client";

import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserPlus } from 'react-icons/fa';
import SortableHeader from '../../../components/SortableHeader';
import useSortable from '../../../hooks/useSortable';

const UserTab = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [countries, setCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const usersPerPage = 5;
  
  // 使用排序钩子
  const { sortField, sortDirection, handleSort, sortData } = useSortable('id', 'asc');

  // 加载用户数据
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await import("../../../../dummy_data/user.json");
        setUsers(data.users);
        setRoles(data.roles);
        setCountries(data.countries);
      } catch (error) {
        console.error("Error loading user data:", error);
        setUsers([]);
        setRoles([]);
        setCountries([]);
      }
    };
    loadUserData();
  }, []);

  // 处理角色变化
  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  // 处理状态变化
  const handleStatusToggle = (userId) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: !user.status } : user
    ));
  };
  
  // 搜索过滤
  const filteredUsers = users.filter(user => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.phone.includes(searchTerm);
  });
  
  // 排序用户数据
  const sortedUsers = sortData(filteredUsers);

  // 分页逻辑
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const pageCount = Math.ceil(sortedUsers.length / usersPerPage);
  
  // 处理搜索时重置页码
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      {/* 标题 */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
      </div>

      {/* 操作栏：新建用户、搜索 */}
      <div className="flex justify-between items-center mb-6">
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700">
          <FaUserPlus className="mr-2" />
          New User
        </button>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader 
                  label="User Name" 
                  field="name" 
                  currentSortField={sortField} 
                  sortDirection={sortDirection} 
                  onSort={handleSort} 
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader 
                  label="Permission Assignment" 
                  field="role" 
                  currentSortField={sortField} 
                  sortDirection={sortDirection} 
                  onSort={handleSort} 
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader 
                  label="Phone Number" 
                  field="phone" 
                  currentSortField={sortField} 
                  sortDirection={sortDirection} 
                  onSort={handleSort} 
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader 
                  label="Email" 
                  field="email" 
                  currentSortField={sortField} 
                  sortDirection={sortDirection} 
                  onSort={handleSort} 
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortableHeader 
                  label="Country" 
                  field="country" 
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No users found matching your search criteria
                </td>
              </tr>
            ) : (
              currentUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="Select role" disabled>Select role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.country}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusToggle(user.id)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500">
          Showing {sortedUsers.length > 0 ? indexOfFirstUser + 1 : 0} to {Math.min(indexOfLastUser, sortedUsers.length)} of {sortedUsers.length} entries
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
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
            disabled={currentPage === pageCount || pageCount === 0}
            className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTab;
