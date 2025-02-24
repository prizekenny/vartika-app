import React, { useState } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: "",
    role: "Super Admin",
    phone: "",
    email: "",
    country: "United States",
    password: "",
  });

  const roles = ["Super Admin", "Admin", "Employee", "Client"];
  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // 重置表单
      setFormData({
        username: "",
        role: "Super Admin",
        phone: "",
        email: "",
        country: "United States",
        password: "",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[480px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User Name</label>
            <input
              type="text"
              placeholder="Enter user name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] appearance-none bg-white"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5] appearance-none bg-white"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="default" onClick={onClose} className="px-6 py-2">
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

export default AddUserModal;
