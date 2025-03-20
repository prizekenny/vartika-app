"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

const ReportTab = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [reports, setReports] = useState({
    profitLoss: {
      revenue: 0,
      expenses: 0,
      netIncome: 0,
      grossProfit: 0,
      operatingIncome: 0,
      previousPeriodRevenue: 0,
      previousPeriodNetIncome: 0,
      period: "",
    },
    balanceSheet: {
      totalAssets: 0,
      currentAssets: 0,
      fixedAssets: 0,
      totalLiabilities: 0,
      currentLiabilities: 0,
      longTermLiabilities: 0,
      totalEquity: 0,
      retainedEarnings: 0,
      period: "",
    },
    cashFlow: {
      operatingCash: 0,
      investingCash: 0,
      financingCash: 0,
      beginningCash: 0,
      endingCash: 0,
      freeCashFlow: 0,
      cashRatio: 0,
      period: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  // 切换展开/折叠状态
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Fetch data from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/quickbooks/reports/overview`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch financial reports"
          );
        }

        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        setError(error.message || "An error occurred while fetching reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Add refresh function
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/quickbooks/reports/overview`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch financial reports");
      }

      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Failed to refresh reports:", error);
      setError(error.message || "An error occurred while refreshing reports");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return "0%";
    return (value * 100).toFixed(1) + "%";
  };

  const calculatePercentage = (amount, total) => {
    if (!amount || !total || total === 0) return "0%";
    return ((amount / total) * 100).toFixed(1) + "%";
  };

  const formatChange = (current, previous) => {
    if (!previous || previous === 0) {
      if (current && current !== 0) return "+100%";
      return "0%";
    }
    const change = ((current - previous) / Math.abs(previous)) * 100;
    const prefix = change > 0 ? "+" : "";
    return `${prefix}${change.toFixed(1)}%`;
  };

  const SectionHeader = ({ title, expanded, onToggle }) => (
    <div
      className="flex items-center bg-gray-50 p-2 cursor-pointer hover:bg-gray-100"
      onClick={onToggle}
    >
      {expanded ? (
        <FaChevronDown className="mr-2" />
      ) : (
        <FaChevronRight className="mr-2" />
      )}
      <span className="font-semibold">{title}</span>
    </div>
  );

  const renderProfitLossTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Metrics
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Period
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Previous Period
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Change %
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              % of Revenue
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4">Revenue</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.profitLoss.revenue)}
            </td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.profitLoss.previousPeriodRevenue)}
            </td>
            <td className="px-6 py-4 text-right">
              {formatChange(
                reports.profitLoss.revenue,
                reports.profitLoss.previousPeriodRevenue
              )}
            </td>
            <td className="px-6 py-4 text-right">100%</td>
          </tr>
          <tr>
            <td className="px-6 py-4">Gross Profit</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.profitLoss.grossProfit)}
            </td>
            <td className="px-6 py-4 text-right">{formatCurrency(0)}</td>
            <td className="px-6 py-4 text-right">
              {formatPercentage(reports.profitLoss.revenueChange)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.profitLoss.grossProfit,
                reports.profitLoss.revenue
              )}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4">Operating Income</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.profitLoss.operatingIncome)}
            </td>
            <td className="px-6 py-4 text-right">{formatCurrency(0)}</td>
            <td className="px-6 py-4 text-right">{formatPercentage(0)}</td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.profitLoss.operatingIncome,
                reports.profitLoss.revenue
              )}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4">Total Expenses</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.profitLoss.expenses)}
            </td>
            <td className="px-6 py-4 text-right">{formatCurrency(0)}</td>
            <td className="px-6 py-4 text-right">{formatPercentage(0)}</td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.profitLoss.expenses,
                reports.profitLoss.revenue
              )}
            </td>
          </tr>
          <tr className="font-bold">
            <td className="px-6 py-4">Net Income</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.profitLoss.netIncome)}
            </td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.profitLoss.previousPeriodNetIncome)}
            </td>
            <td className="px-6 py-4 text-right">
              {formatChange(
                reports.profitLoss.netIncome,
                reports.profitLoss.previousPeriodNetIncome
              )}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.profitLoss.netIncome,
                reports.profitLoss.revenue
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderBalanceSheetTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Metrics
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              % of Total Assets
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Structure %
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr className="font-semibold bg-gray-50">
            <td className="px-6 py-4">Total Assets</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.balanceSheet.totalAssets)}
            </td>
            <td className="px-6 py-4 text-right">100%</td>
            <td className="px-6 py-4 text-right">{formatPercentage(1)}</td>
          </tr>
          <tr>
            <td className="px-6 py-4 pl-8">Current Assets</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.balanceSheet.currentAssets)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.balanceSheet.currentAssets,
                reports.balanceSheet.totalAssets
              )}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.balanceSheet.currentAssets,
                reports.balanceSheet.totalAssets
              )}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 pl-8">Fixed Assets</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.balanceSheet.fixedAssets)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.balanceSheet.fixedAssets,
                reports.balanceSheet.totalAssets
              )}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.balanceSheet.fixedAssets,
                reports.balanceSheet.totalAssets
              )}
            </td>
          </tr>
          <tr className="font-semibold bg-gray-50">
            <td className="px-6 py-4">Total Liabilities</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.balanceSheet.totalLiabilities)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.balanceSheet.totalLiabilities,
                reports.balanceSheet.totalAssets
              )}
            </td>
            <td className="px-6 py-4 text-right">100%</td>
          </tr>
          <tr>
            <td className="px-6 py-4 pl-8">Current Liabilities</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.balanceSheet.currentLiabilities)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.balanceSheet.currentLiabilities,
                reports.balanceSheet.totalAssets
              )}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.balanceSheet.currentLiabilities,
                reports.balanceSheet.totalLiabilities
              )}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 pl-8">Long-term Liabilities</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.balanceSheet.longTermLiabilities)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.balanceSheet.longTermLiabilities,
                reports.balanceSheet.totalAssets
              )}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.balanceSheet.longTermLiabilities,
                reports.balanceSheet.totalLiabilities
              )}
            </td>
          </tr>
          <tr className="font-bold">
            <td className="px-6 py-4">Total Equity</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.balanceSheet.totalEquity)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.balanceSheet.totalEquity,
                reports.balanceSheet.totalAssets
              )}
            </td>
            <td className="px-6 py-4 text-right">{formatPercentage(1)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderCashFlowTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Metrics
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              % of Operating Cash
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4">Beginning Cash</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.cashFlow.beginningCash)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.cashFlow.beginningCash,
                Math.abs(reports.cashFlow.operatingCash)
              )}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4">Operating Cash Flow</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.cashFlow.operatingCash)}
            </td>
            <td className="px-6 py-4 text-right">100%</td>
          </tr>
          <tr>
            <td className="px-6 py-4">Investing Cash Flow</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.cashFlow.investingCash)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.cashFlow.investingCash,
                Math.abs(reports.cashFlow.operatingCash)
              )}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4">Financing Cash Flow</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.cashFlow.financingCash)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.cashFlow.financingCash,
                Math.abs(reports.cashFlow.operatingCash)
              )}
            </td>
          </tr>
          <tr className="font-bold">
            <td className="px-6 py-4">Free Cash Flow</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.cashFlow.freeCashFlow)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.cashFlow.freeCashFlow,
                Math.abs(reports.cashFlow.operatingCash)
              )}
            </td>
          </tr>
          <tr className="font-bold">
            <td className="px-6 py-4">Ending Cash</td>
            <td className="px-6 py-4 text-right">
              {formatCurrency(reports.cashFlow.endingCash)}
            </td>
            <td className="px-6 py-4 text-right">
              {calculatePercentage(
                reports.cashFlow.endingCash,
                Math.abs(reports.cashFlow.operatingCash)
              )}
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4">Cash Ratio</td>
            <td className="px-6 py-4 text-right">
              {formatPercentage(reports.cashFlow.cashRatio)}
            </td>
            <td className="px-6 py-4 text-right">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderFinancialOverview = () => {
    const chartData = [
      {
        name: reports.profitLoss.period,
        Revenue: reports.profitLoss.revenue,
        Expenses: reports.profitLoss.expenses,
        "Net Income": reports.profitLoss.netIncome,
        Assets: reports.balanceSheet.totalAssets,
        Liabilities: reports.balanceSheet.totalLiabilities,
        "Operating Cash": reports.cashFlow.operatingCash,
      },
    ];

    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="Revenue" fill="#4CAF50" />
              <Bar dataKey="Expenses" fill="#f44336" />
              <Bar dataKey="Net Income" fill="#2196F3" />
              <Bar dataKey="Assets" fill="#9C27B0" />
              <Bar dataKey="Liabilities" fill="#FF9800" />
              <Bar dataKey="Operating Cash" fill="#607D8B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold">Error loading reports</p>
            <p className="text-sm mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh
              </button>
              <button
                onClick={() =>
                  (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/quickbooks`)
                }
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Connect QuickBooks
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "profitLoss":
        return renderProfitLossTable();
      case "balanceSheet":
        return renderBalanceSheetTable();
      case "cashFlow":
        return renderCashFlowTable();
      default:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Profit and Loss Summary
              </h3>
              {renderProfitLossTable()}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Balance Sheet Summary
              </h3>
              {renderBalanceSheetTable()}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Cash Flow Summary</h3>
              {renderCashFlowTable()}
            </div>
            {renderFinancialOverview()}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <h2 className="text-2xl font-bold mb-6">Financial Reports</h2>
        <div className="flex space-x-8">
          <button
            className={`pb-4 ${
              activeTab === "all"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Reports
          </button>
          <button
            className={`pb-4 ${
              activeTab === "profitLoss"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("profitLoss")}
          >
            Profit and Loss
          </button>
          <button
            className={`pb-4 ${
              activeTab === "balanceSheet"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("balanceSheet")}
          >
            Balance Sheet
          </button>
          <button
            className={`pb-4 ${
              activeTab === "cashFlow"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("cashFlow")}
          >
            Cash Flow
          </button>
        </div>
      </div>

      <div className="mt-6">{renderTable()}</div>
    </div>
  );
};

export default ReportTab;
