import React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

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
  return (
    <div className="bg-white rounded-lg shadow">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Users Name</th>
            <th className="text-left p-4">Permission Assignment</th>
            <th className="text-left p-4">Phone Number</th>
            <th className="text-left p-4">Email</th>
            <th className="text-left p-4">Country</th>
            <th className="text-left p-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {mockUsers.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="p-4">{user.name}</td>
              <td className="p-4">
                <button className="flex items-center">
                  {user.permission}
                  <ChevronDownIcon className="w-4 h-4 ml-2" />
                </button>
              </td>
              <td className="p-4">{user.phone}</td>
              <td className="p-4">{user.email}</td>
              <td className="p-4">{user.country}</td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {user.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 border-t flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing data 1 to 8 of 256K entries
        </span>
        <div className="flex gap-2">
          <Pagination />
        </div>
      </div>
    </div>
  );
};

const Pagination = () => {
  return (
    <div className="flex gap-1">
      <button className="px-3 py-1 border rounded-lg">&lt;</button>
      <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
      <button className="px-3 py-1 border rounded-lg">2</button>
      <button className="px-3 py-1 border rounded-lg">3</button>
      <button className="px-3 py-1 border rounded-lg">4</button>
      <button className="px-3 py-1 border rounded-lg">...</button>
      <button className="px-3 py-1 border rounded-lg">40</button>
      <button className="px-3 py-1 border rounded-lg">&gt;</button>
    </div>
  );
};

export default UserTable;
