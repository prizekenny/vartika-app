import React, { useState } from "react";
import Button from "./Button";
import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api/users";

const AddUserModal = ({ isOpen, setShowAddUserForm, fetchUsers }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    user_type: "Client",
    status: "active",
    roles: ["Client"],
  });

  const roles = ["SuperAdmin", "Admin", "Employee", "Client", "Guest"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_BASE_URL, formData);
      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        user_type: "Client",
        status: "active",
        roles: ["Client"],
      });
      setShowAddUserForm(false);
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[480px]">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="User Name"
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <InputField
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <DropdownField
            label="Role"
            value={formData.roles[0]}
            options={roles}
            onChange={(e) =>
              setFormData({ ...formData, roles: [e.target.value] })
            }
          />
          <DropdownField
            label="Status"
            value={formData.status}
            options={["active", "inactive"]}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="default"
              onClick={() => setShowAddUserForm(false)}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="px-6 py-2">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, type, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
      value={value}
      onChange={onChange}
    />
  </div>
);

const DropdownField = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select
      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
      value={value ?? ""}
      onChange={onChange}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default AddUserModal;
