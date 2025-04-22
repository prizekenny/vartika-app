"use client";

import React, { useState, useEffect } from "react";
import { FaSearch, FaUserPlus, FaTrash, FaEdit } from "react-icons/fa";
import { getUsers, updateUser, deleteUser } from "@/api/users";
import AddUserModal from "../../../components/AddUserModal";
import EditUserModal from "../../../components/EditUserModal";

const UserTab = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [sortBy, setSortBy] = useState("Newest");
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await updateUser(userId, { status: newStatus });
      fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setShowEditUserForm(true);
  };

  const sortUsers = (users, criteria) => {
    let sorted = [...users];
    switch (criteria) {
      case "Newest":
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "Oldest":
        sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "A-Z":
        sorted.sort((a, b) => a.username.localeCompare(b.username));
        break;
      case "Status":
        sorted.sort((a, b) => (a.status === "active" ? -1 : 1));
        break;
      case "LastLogin":
        sorted.sort(
          (a, b) => new Date(b.last_login_time) - new Date(a.last_login_time)
        );
        break;
      default:
        break;
    }
    return sorted;
  };

  const filteredUsers = sortUsers(
    (Array.isArray(users) ? users : []).filter(
      (user) =>
        typeof user.username === "string" &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    sortBy
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const pageCount = Math.ceil(filteredUsers.length / usersPerPage);

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (pageCount <= maxPagesToShow) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(pageCount - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < pageCount - 2) pages.push("...");
      pages.push(pageCount);
    }

    return (
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
        >
          {"<"}
        </button>
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-3 py-1">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded-lg ${
                currentPage === page
                  ? "bg-purple-600 text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, pageCount))
          }
          disabled={currentPage === pageCount}
          className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
        >
          {">"}
        </button>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
      </div>
      <div className="mb-10 flex justify-between items-center">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700"
          onClick={() => setShowAddUserForm(true)}
        >
          <FaUserPlus className="mr-2" /> New User
        </button>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <select
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="A-Z">A → Z (Username)</option>
            <option value="Status">Status (Active First)</option>
            <option value="LastLogin">Last Login (Recent First)</option>
          </select>
        </div>
      </div>

      {showAddUserForm && (
        <AddUserModal
          isOpen={showAddUserForm}
          setShowAddUserForm={setShowAddUserForm}
          fetchUsers={fetchUsers}
        />
      )}
      {showEditUserForm && (
        <EditUserModal
          isOpen={showEditUserForm}
          user={editUser}
          setShowEditUserForm={setShowEditUserForm}
          fetchUsers={fetchUsers}
        />
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user) => (
              <tr key={user.user_id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.roles && user.roles.length > 0 ? user.roles[0] : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.phone || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() =>
                      handleStatusToggle(user.user_id, user.status)
                    }
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status === "active" ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex space-x-4">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.user_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <div>
          Showing {indexOfFirstUser + 1} to{" "}
          {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
          {filteredUsers.length} entries
        </div>
        {renderPagination()}
      </div>
    </div>
  );
};

export default UserTab;
