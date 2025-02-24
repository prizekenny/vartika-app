import React from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

const AddUserModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter user name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select className="w-full border rounded-lg px-3 py-2">
              <option>Super Admin</option>
              <option>Admin</option>
              <option>User</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select className="w-full border rounded-lg px-3 py-2">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2 pr-10"
                placeholder="Enter password"
              />
              <EyeIcon className="w-5 h-5 absolute right-3 top-2.5 text-gray-400 cursor-pointer" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
