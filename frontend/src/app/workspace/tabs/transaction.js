"use client";

import React, { useState } from "react";
import { Tab } from "@headlessui/react";

export default function TransactionTab() {
  const [transactions, setTransactions] = useState([]); // State to store transactions data

  /**
   * Fetch transactions from QuickBooks API.
   * Steps:
   * 1. Define the API endpoint for QuickBooks.
   * 2. Set up headers for authentication and content type.
   * 3. Send a GET request to fetch data.
   * 4. Handle success by extracting relevant data and updating state.
   * 5. Handle failure with error logging and fallback to dummy data.
   */
  const fetchTransactions = async () => {
    try {
      // 1. Define the API endpoint for QuickBooks
      const apiUrl =
        "https://api.quickbooks.com/v3/company/{company_id}/reports/TransactionList"; // Replace {company_id} with actual company ID

      // 2. Set up headers for the API request
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer <your_access_token>`, // Replace with actual OAuth token
      };

      // 3. Send the GET request
      const response = await fetch(apiUrl, { method: "GET", headers });

      // 4. Check if the response is successful
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      // 5. Parse the response and extract transaction data
      const data = await response.json();
      const transactionsData = data.QueryResponse
        ? data.QueryResponse.Transaction
        : [];

      // 6. Update the state with the fetched data
      setTransactions(transactionsData);
    } catch (error) {
      // 7. Handle errors and fallback to dummy data
      console.error("Failed to fetch transactions:", error);
      alert("Failed to load transactions. Displaying sample data instead.");

      // 8. Dummy data (at least 5 transactions)
      setTransactions([
        {
          date: "2024-12-01",
          bankDetail: "Deposit from Client A",
          payee: "Client A",
          categorizeOrMatch: "Income",
          tax: "5%",
          spent: "-",
          received: "$1,500.00",
          doc: "Invoice-123",
        },
        {
          date: "2024-12-02",
          bankDetail: "Utility Bill",
          payee: "City Utilities",
          categorizeOrMatch: "Expense",
          tax: "0%",
          spent: "$200.00",
          received: "-",
          doc: "Bill-456",
        },
        {
          date: "2024-12-03",
          bankDetail: "Office Supplies",
          payee: "Stationery Shop",
          categorizeOrMatch: "Expense",
          tax: "12%",
          spent: "$50.00",
          received: "-",
          doc: "Receipt-789",
        },
        {
          date: "2024-12-04",
          bankDetail: "Service Payment",
          payee: "Freelancer B",
          categorizeOrMatch: "Contractor Expense",
          tax: "15%",
          spent: "$600.00",
          received: "-",
          doc: "Payment-101",
        },
        {
          date: "2024-12-05",
          bankDetail: "Refund from Vendor",
          payee: "Vendor C",
          categorizeOrMatch: "Income",
          tax: "0%",
          spent: "-",
          received: "$300.00",
          doc: "Refund-202",
        },
      ]);
    }
  };

  // Sub-tabs for the Transactions section
  const subTabs = [
    {
      name: "Bank Transactions",
      component: (
        <BankTransactions
          fetchTransactions={fetchTransactions}
          transactions={transactions}
        />
      ),
    },
    {
      name: "App Transactions",
      component: <p>App Transactions are under construction.</p>,
    },
    {
      name: "Receipts",
      component: <p>Receipts content is under construction.</p>,
    },
    {
      name: "Reconcile",
      component: <p>Reconcile content is under construction.</p>,
    },
    { name: "Rules", component: <p>Rules content is under construction.</p> },
    {
      name: "Chart of Accounts",
      component: <p>Chart of Accounts content is under construction.</p>,
    },
    {
      name: "Recurring Transactions",
      component: <p>Recurring Transactions content is under construction.</p>,
    },
  ];

  return (
    <div className="p-4 bg-white shadow rounded-md">
      <Tab.Group>
        {/* Sub-Tabs Navigation */}
        <Tab.List className="flex space-x-4 border-b border-gray-300 mb-4">
          {subTabs.map((tab, index) => (
            <Tab
              key={index}
              className={({ selected }) =>
                `px-4 py-2 text-sm font-medium ${
                  selected
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>

        {/* Sub-Tabs Content */}
        <Tab.Panels>
          {subTabs.map((tab, index) => (
            <Tab.Panel key={index} className="focus:outline-none">
              {tab.component}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

// Bank Transactions Tab Content
function BankTransactions({ fetchTransactions, transactions }) {
  return (
    <div>
      {/* Account Type and Update Button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <label htmlFor="accountType" className="text-gray-700 font-medium">
            Account Type
          </label>
          <select
            id="accountType"
            className="mt-1 ml-2 block w-48 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="Chequing Account">Chequing Account</option>
            <option value="Saving Account">Saving Account</option>
          </select>
        </div>
        <div className="flex items-center">
          <p className="text-red-700 ">Use Case 2 ---- </p>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
          >
            Update
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          <label
            htmlFor="dateFilter"
            className="mr-2 text-gray-700 font-medium"
          >
            Filter by Date
          </label>
          <select
            id="dateFilter"
            className="block w-48 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="All Dates">All Dates</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>
        </div>
        <div className="flex items-center ml-5">
          <label
            htmlFor="transactionTypeFilter"
            className="mr-2 text-gray-700 font-medium"
          >
            Filter by Transaction Type
          </label>
          <select
            id="transactionTypeFilter"
            className="block w-48 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="All Transactions">All Transactions</option>
            <option value="Deposits">Deposits</option>
            <option value="Withdrawals">Withdrawals</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="overflow-auto border border-gray-300 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">✓</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Bank Detail</th>
              <th className="px-4 py-2 text-left">Payee</th>
              <th className="px-4 py-2 text-left">Categorize or MATCH</th>
              <th className="px-4 py-2 text-left">Tax</th>
              <th className="px-4 py-2 text-right">Spent</th>
              <th className="px-4 py-2 text-right">Received</th>
              <th className="px-4 py-2 text-left">Doc.</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="px-4 py-2">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-2">{transaction.date}</td>
                <td className="px-4 py-2">{transaction.bankDetail}</td>
                <td className="px-4 py-2">{transaction.payee}</td>
                <td className="px-4 py-2">{transaction.categorizeOrMatch}</td>
                <td className="px-4 py-2">{transaction.tax}</td>
                <td className="px-4 py-2 text-right">{transaction.spent}</td>
                <td className="px-4 py-2 text-right">{transaction.received}</td>
                <td className="px-4 py-2">{transaction.doc}</td>
                <td className="px-4 py-2">
                  <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
