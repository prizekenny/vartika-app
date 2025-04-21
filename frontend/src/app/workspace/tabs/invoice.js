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
  const [meta, setMeta] = useState({ total: 0, max: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadInvoices();
  }, [page]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await getInvoices({ page, pageSize });
      const data = res;
      console.log("📥 Loaded invoices:", data);
      setInvoices(data.Invoice || []);
      setMeta({
        total: data.totalCount || 0,
        max: data.maxResults || 0,
      });
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
