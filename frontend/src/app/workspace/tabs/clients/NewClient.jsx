"use client";

import React, { useState, useEffect } from "react";
import { getUsersWithoutClient } from "@/api/users";
import { createClient } from "@/api/clients";
import { getQuickBooksCustomersWithoutClient } from "@/api/quickbooks";

const NewClient = ({ isOpen, onClose, onSuccess }) => {
  const [type, setType] = useState("Individual");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [formData, setFormData] = useState({});
  const [userSearch, setUserSearch] = useState("");
  const [qbCustomers, setQbCustomers] = useState([]);
  const [qbSearch, setQbSearch] = useState("");

  useEffect(() => {
    const loadQbCustomers = async () => {
      const res = await getQuickBooksCustomersWithoutClient();
      setQbCustomers(res || []);
    };
    if (isOpen) {
      fetchUsers();
      loadQbCustomers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    const res = await getUsersWithoutClient();
    setAvailableUsers(res?.data || []); // ← 注意这里
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Auto-fill missing fields if type is "Individual"
    if (type === "Individual") {
      const selectedUser = availableUsers.find(
        (u) => u.user_id === selectedUserId
      );
      if (selectedUser) {
        formData.contact_name = selectedUser.username;
        formData.contact_email = selectedUser.email;
        formData.contact_phone = selectedUser.phone || "";
        formData.contact_address = selectedUser.address || "";
        formData.client_name = selectedUser.username;
        formData.status = "active";
      }
    }
    // Validation and auto-fill for Company
    if (type === "Company") {
      if (
        !formData.contact_name ||
        !formData.contact_email ||
        !formData.contact_phone
      ) {
        alert("Company clients must have contact name, email, and phone.");
        return;
      }
      // Set fields from selected company if available
      const selectedCompany = qbCustomers.find(
        (c) => c.Id === formData.qb_customer_id
      );
      if (selectedCompany) {
        formData.address =
          (selectedCompany.BillAddr?.Line1 || "") +
          (selectedCompany.BillAddr?.Line1 ? ", " : "") +
          (selectedCompany.BillAddr?.City || "") +
          (selectedCompany.BillAddr?.City ? ", " : "") +
          (selectedCompany.BillAddr?.PostalCode || "");
        if (!formData.client_name) {
          formData.client_name =
            selectedCompany.CompanyName || selectedCompany.DisplayName || "";
        }
        if (!formData.phone && selectedCompany.PrimaryPhone?.FreeFormNumber) {
          formData.phone = selectedCompany.PrimaryPhone.FreeFormNumber;
        }
      }
      formData.status = "active";
    }
    const success = await createClient({
      ...formData,
      type,
      user_id: selectedUserId,
    });
    if (success) {
      onSuccess?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Add New Client</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Search and Assign User</label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-2"
              placeholder="Search user by name or email..."
            />
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="">Select User</option>
              {availableUsers
                .filter((user) => {
                  const keyword = userSearch.toLowerCase();
                  return (
                    user.username?.toLowerCase().includes(keyword) ||
                    user.email?.toLowerCase().includes(keyword)
                  );
                })
                .map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.username || "Unnamed"} - {user.email} (
                    {user.user_type})
                  </option>
                ))}
            </select>
          </div>

          {selectedUserId && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p>
                <strong>Username:</strong>{" "}
                {availableUsers.find((u) => u.user_id === selectedUserId)
                  ?.username || "N/A"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {availableUsers.find((u) => u.user_id === selectedUserId)
                  ?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {availableUsers.find((u) => u.user_id === selectedUserId)
                  ?.phone || "N/A"}
              </p>
              <p>
                <strong>Contact Name:</strong>{" "}
                {availableUsers.find((u) => u.user_id === selectedUserId)
                  ?.username || "N/A"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {availableUsers.find((u) => u.user_id === selectedUserId)
                  ?.address || "N/A"}
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-1">Client Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </select>
          </div>

          {type === "Individual" && (
            <div className="mb-4 text-sm text-gray-500">
              <p>
                This client will use the user information above as their
                identity.
              </p>
            </div>
          )}

          {type === "Company" && (
            <div className="mb-4">
              <label className="block mb-1">Search Company (QB)</label>
              <input
                type="text"
                value={qbSearch}
                onChange={(e) => setQbSearch(e.target.value)}
                placeholder="Type to filter companies..."
                className="border px-3 py-2 rounded w-full mb-2"
              />
              <select
                name="qb_customer_id"
                value={formData.qb_customer_id || ""}
                onChange={(e) => {
                  const selected = qbCustomers.find(
                    (c) => c.Id === e.target.value
                  );
                  setFormData((prev) => ({
                    ...prev,
                    qb_customer_id: selected?.Id,
                    client_name:
                      selected?.CompanyName || selected?.DisplayName || "",
                  }));
                }}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">Select Company</option>
                {qbCustomers
                  .filter((c) =>
                    c.DisplayName.toLowerCase().includes(qbSearch.toLowerCase())
                  )
                  .map((c) => (
                    <option key={c.Id} value={c.Id}>
                      {c.DisplayName}{" "}
                      {c.CompanyName ? `(${c.CompanyName})` : ""}
                    </option>
                  ))}
              </select>
              <div className="mt-4">
                <label className="block mb-1">Contact Name</label>
                <input
                  name="contact_name"
                  value={formData.contact_name || ""}
                  onChange={handleInputChange}
                  className="border px-3 py-2 rounded w-full"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="mt-4">
                <label className="block mb-1">Contact Email</label>
                <input
                  name="contact_email"
                  type="email"
                  value={formData.contact_email || ""}
                  onChange={handleInputChange}
                  className="border px-3 py-2 rounded w-full"
                  placeholder="e.g. jane@example.com"
                />
              </div>
              <div className="mt-4">
                <label className="block mb-1">Contact Phone</label>
                <input
                  name="contact_phone"
                  value={formData.contact_phone || ""}
                  onChange={handleInputChange}
                  className="border px-3 py-2 rounded w-full"
                  placeholder="e.g. 123-456-7890"
                />
              </div>
            </div>
          )}

          <div className="mb-4 mt-2">
            <label className="block mb-1">Remark</label>
            <textarea
              name="remark"
              value={formData.remark || ""}
              onChange={handleInputChange}
              className="border px-3 py-2 rounded w-full"
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClient;
