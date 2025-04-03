"use client";

import React, { useState, useEffect } from "react";
import FilterBar from "@/components/common/FilterBar";
import Pagination from "@/components/common/Pagination";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import CreateDialog from "@/components/common/CreateDialog";
import Button from "@/components/common/Button";
import { formatDate, formatDateTime } from "@/lib/format";
import useFilter from "@/hooks/useFilter";

const statusMap = [
  { label: "Planned", value: "Planned" },
  { label: "In Progress", value: "InProgress" },
  { label: "Completed", value: "Completed" },
];

const AssignmentTab = () => {
  const [assignments, setAssignments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const statusFilter = useFilter(statusMap);

  useEffect(() => {
    const loadAssignments = async () => {
      setLoading(true);
      const response = await import("../../../../dummy_data/assignment.json");

      // ✅ 规范化 dummy data
      const fixed = response.assignments.map((a) => ({
        ...a,
        status: a.status.replace(" ", ""), // "In Progress" -> "InProgress"
      }));

      setAssignments(fixed);
      setLoading(false);
    };
    loadAssignments();
  }, []);

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesStatus =
      !statusFilter.value || assignment.status === statusFilter.value;
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || assignment.dueDate.includes(dateFilter);
    return matchesStatus && matchesSearch && matchesDate;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssignments = filteredAssignments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
        <Button text="Create" onClick={() => setOpenCreate(true)} />
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        statusValue={statusFilter.label}
        onStatusChange={statusFilter.setLabel}
        dateValue={dateFilter}
        onDateChange={setDateFilter}
        statusOptions={statusFilter.options}
      />

      {loading ? (
        <LoadingIndicator />
      ) : currentAssignments.length === 0 ? (
        <EmptyState message="No Assignments Found" />
      ) : (
        <DataTable
          columns={[
            {
              key: "title",
              label: "Assignment",
              render: (row) => (
                <>
                  <div className="font-semibold">{row.title}</div>
                  <div className="text-sm text-gray-500">{row.assignee}</div>
                </>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <StatusBadge
                  status={
                    statusMap.find((s) => s.value === row.status)?.label ||
                    row.status
                  }
                />
              ),
            },
            {
              key: "dueDate",
              label: "Due Date",
              render: (row) => formatDate(row.dueDate),
            },
            {
              key: "createTime",
              label: "Create Time",
              render: (row) => formatDateTime(row.createTime),
            },
          ]}
          data={currentAssignments}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <CreateDialog
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Create Assignment"
        fields={[
          { name: "title", label: "Title" },
          { name: "assignee", label: "Assignee" },
          { name: "dueDate", label: "Due Date", type: "date" },
        ]}
        onSubmit={(data) => console.log("Create assignment", data)}
      />
    </div>
  );
};

export default AssignmentTab;
