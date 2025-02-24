import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

const mockUsers = [
  {
    id: 1,
    name: "Jane Cooper",
    permission: "Super Admin",
    phone: "(225) 555-0118",
    email: "jane@microsoft.com",
    country: "United States",
    status: "Active",
  },
  // Add more mock users as needed
];

const UserTable = () => {
  const roles = ["Super Admin", "Admin", "Employee", "Client"];
  const statuses = ["Active", "Inactive"];

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  return (
    <div className="bg-white rounded-lg shadow">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 text-sm font-medium text-gray-600">
              Users Name
            </th>
            <th className="text-left p-4 text-sm font-medium text-gray-600">
              Permission Assignment
            </th>
            <th className="text-left p-4 text-sm font-medium text-gray-600">
              Phone Number
            </th>
            <th className="text-left p-4 text-sm font-medium text-gray-600">
              Email
            </th>
            <th className="text-left p-4 text-sm font-medium text-gray-600">
              Country
            </th>
            <th className="text-left p-4 text-sm font-medium text-gray-600">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {mockUsers.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="p-4 text-sm">{user.name}</td>
              <td className="p-4">
                <div className="relative inline-block">
                  <select
                    value={selectedRole || "Select Role"}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="appearance-none border rounded-lg px-3 py-2 pr-8 bg-white text-sm focus:outline-none min-w-[140px]"
                  >
                    <option disabled>Select Role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="w-4 h-4 absolute right-2 top-3 text-gray-500 pointer-events-none" />
                </div>
              </td>
              <td className="p-4 text-sm">{user.phone}</td>
              <td className="p-4 text-sm">{user.email}</td>
              <td className="p-4 text-sm">{user.country}</td>
              <td className="p-4">
                <select
                  value={selectedStatus || user.status}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    (selectedStatus || user.status) === "Active"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 border-t flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing data 1 to 8 of 256K entries
        </span>
        <div className="flex gap-1">
          <Button variant="pagination">&lt;</Button>
          <Button variant="paginationActive">1</Button>
          <Button variant="pagination">2</Button>
          <Button variant="pagination">3</Button>
          <Button variant="pagination">4</Button>
          <Button variant="pagination">...</Button>
          <Button variant="pagination">40</Button>
          <Button variant="pagination">&gt;</Button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
