"use client";

import React, { useState, useEffect } from "react";
import { getClients, deleteClient, updateClient } from "@/api/clients";
import DataTable from "@/components/common/DataTable";
import Pagination from "@/components/common/Pagination";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import EmptyState from "@/components/common/EmptyState";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import NewClient from "./NewClient";
import EditClient from "./EditClient";

const ClientTab = () => {
  const [clients, setClients] = useState([]);
  const [meta, setMeta] = useState({ total: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, [page, search]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await getClients({ page, pageSize, search });

      // ✅ 直接设置
      setClients(Array.isArray(res) ? res : []);
      setMeta({ total: res.length || 0 }); // 如果没有分页，直接统计长度
    } catch (error) {
      console.error("❌ Failed to fetch clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await deleteClient(clientId); // ⬅️ 需要从 @/api/clients 导入 deleteClient
      fetchClients(); // 刷新数据
    } catch (err) {
      console.error("❌ Failed to delete client:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const columns = [
    { key: "client_name", label: "Client" },
    { key: "type", label: "Type" },
    { key: "contact_name", label: "Contact Name" },
    { key: "contact_email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "phone", label: "Phone" },
    {
      key: "created_at",
      label: "Open Time",
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    { key: "remark", label: "Remark" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex space-x-4">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => {
              setEditingClient(row);
              setShowEditClientModal(true);
            }}
          >
            <FaEdit />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDelete(row.client_id)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Clients</h2>

      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700"
          onClick={() => setShowAddClientModal(true)}
        >
          <FaPlus className="mr-2" /> New Client
        </button>
        <form onSubmit={handleSearch} className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </form>
      </div>

      {loading ? (
        <LoadingIndicator />
      ) : clients.length === 0 ? (
        <EmptyState message="No clients found." />
      ) : (
        <>
          <DataTable columns={columns} data={clients} />
          <Pagination
            currentPage={page}
            totalItems={meta.total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}

      {showAddClientModal && (
        <NewClient
          isOpen={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          onSuccess={() => {
            setShowAddClientModal(false);
            fetchClients();
          }}
        />
      )}
      {showEditClientModal && (
        <EditClient
          client={editingClient}
          onClose={() => {
            setShowEditClientModal(false);
            setEditingClient(null);
          }}
          onSave={async (updatedData) => {
            try {
              await updateClient(editingClient.client_id, updatedData);
              setShowEditClientModal(false);
              setEditingClient(null);
              fetchClients();
            } catch (err) {
              console.error("❌ Failed to update client:", err);
            }
          }}
        />
      )}
    </div>
  );
};

export default ClientTab;
