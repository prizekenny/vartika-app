"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/common/DataTable";
import Pagination from "@/components/common/Pagination";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import EmptyState from "@/components/common/EmptyState";
import { getInvoices, downloadInvoicePdf } from "@/api/quickbooks";
import { formatDateTime } from "@/lib/format";

const InvoiceTab = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, max: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    minTotal: "",
    maxTotal: "",
    startDate: "",
    endDate: "",
  });
  const pageSize = 10;

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  useEffect(() => {
    const paginated = filteredData.slice(
      (page - 1) * pageSize,
      page * pageSize
    );
    setInvoices(paginated);
  }, [page, filteredData]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await getInvoices(); // fetch full list once
      const all = res.Invoice || [];

      let filtered = all;

      const hasFilters =
        filters.search ||
        filters.minTotal ||
        filters.maxTotal ||
        filters.startDate ||
        filters.endDate;

      if (hasFilters) {
        filtered = all.filter((inv) => {
          const total = parseFloat(inv.TotalAmt || 0);
          const name = inv.CustomerRef?.name?.toLowerCase() || "";
          const txnDate = new Date(inv.TxnDate);

          const matchesSearch = filters.search
            ? name.includes(filters.search.toLowerCase())
            : true;

          const matchesMin = filters.minTotal
            ? total >= parseFloat(filters.minTotal)
            : true;

          const matchesMax = filters.maxTotal
            ? total <= parseFloat(filters.maxTotal)
            : true;

          const matchesStart = filters.startDate
            ? txnDate >= new Date(filters.startDate)
            : true;

          const matchesEnd = filters.endDate
            ? txnDate <= new Date(filters.endDate)
            : true;

          return (
            matchesSearch &&
            matchesMin &&
            matchesMax &&
            matchesStart &&
            matchesEnd
          );
        });
      }

      setFilteredData(filtered);
      setMeta({
        total: filtered.length,
        max: all.length,
      });
      setPage(1); // Reset to first page
    } catch (err) {
      console.error("❌ Failed to load invoices", err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoiceId) => {
    try {
      await downloadInvoicePdf(invoiceId);
    } catch (err) {
      console.error("❌ Failed to download invoice", err);
    }
  };

  const columns = [
    { key: "DocNumber", label: "Invoice #" },
    {
      key: "CustomerRef",
      label: "Customer",
      render: (row) => row.CustomerRef?.name || "—",
    },
    {
      key: "TxnDate",
      label: "Date",
      render: (row) => formatDateTime(row.TxnDate),
    },
    {
      key: "DueDate",
      label: "Due",
      render: (row) => formatDateTime(row.DueDate),
    },
    { key: "TotalAmt", label: "Total ($)" },
    { key: "Balance", label: "Balance ($)" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          className="text-blue-600 hover:underline"
          onClick={() => handleDownload(row.Id)}
        >
          Download PDF
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Customer name"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border border-gray-300 rounded px-3 py-1 text-sm w-full"
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min Amount"
            value={filters.minTotal}
            onChange={(e) =>
              setFilters({ ...filters, minTotal: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-1 text-sm w-full"
          />
          <input
            type="number"
            placeholder="Max Amount"
            value={filters.maxTotal}
            onChange={(e) =>
              setFilters({ ...filters, maxTotal: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-1 text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-1 text-sm w-full"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="border border-gray-300 rounded px-3 py-1 text-sm w-full"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3 flex justify-end">
          <button
            onClick={() => {
              setPage(1);
            }}
            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {meta.total > 0 && (
        <p className="text-sm text-gray-500">
          Showing {invoices.length} of {meta.total} invoices
        </p>
      )}

      {loading ? (
        <LoadingIndicator />
      ) : invoices.length === 0 ? (
        <EmptyState message="No invoices found." />
      ) : (
        <>
          <DataTable columns={columns} data={invoices} />
          <Pagination
            currentPage={page}
            totalItems={meta.total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default InvoiceTab;
