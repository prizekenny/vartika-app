import React, { useState } from "react";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import UserTable from "../../../components/UserTable";
import Button from "../../../components/Button";
import AddUserModal from "../../../components/AddUserModal";

const User = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">User</h1>
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2"
        >
          <span className="text-sm">+ New User</span>
        </Button>
        <div className="flex items-center gap-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg w-[280px] focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      <UserTable />

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default User;
