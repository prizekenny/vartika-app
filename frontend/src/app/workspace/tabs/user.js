"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { FaSearch, FaUserPlus, FaTrash, FaEdit } from "react-icons/fa";
import { getUsers, updateUser, deleteUser } from "@/api/users";
import AddUserModal from "../../../components/AddUserModal";
import EditUserModal from "../../../components/EditUserModal";
import Pagination from "../../../components/common/Pagination"; // 导入分页组件
import DataTable from "../../../components/common/DataTable";

const UserTab = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [sortBy, setSortBy] = useState("Newest");
  const [currentUser, setCurrentUser] = useState(null);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/current-user");
      setCurrentUser(res.data.user);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

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

  return (
    <div className="p-6">
      {currentUser && (
        <div className="mb-4 text-gray-700">
          Logged in as:{" "}
          <span className="font-semibold">{currentUser.email}</span>
        </div>
      )}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
      </div>
      <div className="mb-10 flex justify-between items-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
          onClick={() => setShowAddUserForm(true)}
        >
          <FaUserPlus className="mr-2" /> New User
        </button>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <select
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <DataTable 
          columns={[
            { key: "username", label: "User Name", width: "120px" },
            { key: "roles", label: "Role", width: "120px", render: (row) => 
              row.roles && row.roles.length > 0 ? row.roles[0] : "N/A" },
            { key: "phone", label: "Phone", width: "120px" },
            { key: "email", label: "Email", width: "180px" },
            { key: "status", label: "Status", width: "100px", render: (row) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusToggle(row.user_id, row.status);
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  row.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {row.status === "active" ? "Active" : "Inactive"}
              </button>
            )},
            { key: "actions", label: "Actions", width: "100px", render: (row) => (
              <div className="flex space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditUser(row);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUser(row.user_id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          ]}
          data={currentUsers}
          onRowClick={handleEditUser}
        />
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <div>
          Showing {indexOfFirstUser + 1} to{" "}
          {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
          {filteredUsers.length} entries
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={pageCount}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default UserTab;
