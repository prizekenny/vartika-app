import React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

const UserTable = ({
  users,
  loading,
  onRefresh,
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const roles = ["Super Admin", "Admin", "Employee", "Client"];
  const statuses = ["Active", "Inactive"];

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      onRefresh();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const { currentPage, pages: totalPages } = pagination;

    // Always show first page
    pages.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "paginationActive" : "pagination"}
        onClick={() => onPageChange(1)}
      >
        1
      </Button>
    );

    // Calculate range
    let start = Math.max(2, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    // Add ellipsis after first page
    if (start > 2) {
      pages.push(
        <Button key="ellipsis1" variant="pagination" disabled>
          ...
        </Button>
      );
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "paginationActive" : "pagination"}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // Add ellipsis before last page
    if (end < totalPages - 1) {
      pages.push(
        <Button key="ellipsis2" variant="pagination" disabled>
          ...
        </Button>
      );
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(
        <Button
          key={totalPages}
          variant={
            currentPage === totalPages ? "paginationActive" : "pagination"
          }
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
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
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm">{user.name}</td>
                <td className="p-4">
                  <div className="relative inline-block">
                    <select
                      value={user.permission}
                      onChange={(e) => {
                        // Handle role change
                      }}
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
                    value={user.status}
                    onChange={(e) =>
                      handleStatusChange(user.id, e.target.value)
                    }
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.status === "Active"
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
      )}
      <div className="p-4 border-t flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
          {Math.min(
            pagination.currentPage * pagination.limit,
            pagination.total
          )}{" "}
          of {pagination.total} entries
        </span>
        <div className="flex gap-1">
          <Button
            variant="pagination"
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            &lt;
          </Button>
          {renderPageNumbers()}
          <Button
            variant="pagination"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.pages}
          >
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
