"use client";

import React, { useState, useEffect } from "react";
import FilterBar from "@/components/common/FilterBar";
import Pagination from "@/components/common/Pagination";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import Button from "@/components/common/Button";
import CreateDialog from "@/components/common/CreateDialog";
import { getLogs, exportLogs } from "@/api/log";
import { formatDateTime } from "@/lib/format";
import useFilter from "@/hooks/useFilter";

const actionMap = [
  { label: "Get Company Info", value: "get_company_info" },
  { label: "Get Invoices", value: "get_invoices" },
  { label: "Report Profit & Loss", value: "report_profit_and_loss" },
  {
    label: "Report Profit & Loss Detail",
    value: "report_profit_and_loss_detail",
  },
];

const LogTab = () => {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const actionFilter = useFilter(actionMap);

  const logsPerPage = 7;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadLogs();
  }, [currentPage, searchTerm, actionFilter.label, startDate, endDate]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await getLogs({
        page: currentPage,
        pageSize: logsPerPage,
        user_email: searchTerm,
        action: actionFilter.value,
        startDate,
        endDate,
      });

      // ✅ 规范化 logs status to value-only
      const fixed = (res.data.logs || []).map((l) => ({
        ...l,
        action: l.action?.replaceAll(" ", "_").toLowerCase(),
      }));

      setLogs(fixed);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("❌ [LogTab] Failed to load logs", err);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / logsPerPage);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Logs</h2>
        <Button
          variant="secondary"
          text="Export"
          onClick={() =>
            exportLogs({
              user_email: searchTerm,
              action: actionFilter.value,
              startDate,
              endDate,
            })
          }
        />
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        statusValue={actionFilter.label}
        onStatusChange={actionFilter.setLabel}
        dateValue={startDate}
        onDateChange={setStartDate}
        statusOptions={actionFilter.options}
      />

      {loading ? (
        <LoadingIndicator />
      ) : logs.length === 0 ? (
        <EmptyState message="No logs found." />
      ) : (
        <DataTable
          columns={[
            {
              key: "created_at",
              label: "Timestamp",
              render: (row) => formatDateTime(row.created_at),
            },
            { key: "user_email", label: "User" },
            {
              key: "action",
              label: "Action",
              render: (row) => (
                <StatusBadge
                  status={
                    actionMap.find((a) => a.value === row.action)?.label ||
                    row.action
                  }
                />
              ),
            },
            { key: "target", label: "Target" },
            { key: "ip_address", label: "IP" },
          ]}
          data={logs}
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
        title="Create Log (Demo Only)"
        fields={[{ name: "action", label: "Action" }]}
        onSubmit={(data) => console.log("create log", data)}
      />
    </div>
  );
};

export default LogTab;
