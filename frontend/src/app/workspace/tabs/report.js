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
import { getFinancialReport } from "@/api/quickbooks";
import DataTable from "@/components/common/DataTable";

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

        const data = await getFinancialReport();
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

      const data = await getFinancialReport();
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

  const convertReportToTableData = (reportType) => {
    switch (reportType) {
      case "profitLoss":
        return [
          { 
            metric: "Revenue", 
            currentPeriod: reports.profitLoss.revenue, 
            previousPeriod: reports.profitLoss.previousPeriodRevenue,
            change: formatChange(
              reports.profitLoss.revenue,
              reports.profitLoss.previousPeriodRevenue
            ),
            percentage: "100%"
          },
          { 
            metric: "Gross Profit", 
            currentPeriod: reports.profitLoss.grossProfit,
            previousPeriod: 0,
            change: formatPercentage(reports.profitLoss.revenueChange),
            percentage: calculatePercentage(
              reports.profitLoss.grossProfit,
              reports.profitLoss.revenue
            )
          },
          { 
            metric: "Operating Income", 
            currentPeriod: reports.profitLoss.operatingIncome,
            previousPeriod: 0,
            change: formatPercentage(0),
            percentage: calculatePercentage(
              reports.profitLoss.operatingIncome,
              reports.profitLoss.revenue
            )
          },
          { 
            metric: "Total Expenses", 
            currentPeriod: reports.profitLoss.expenses,
            previousPeriod: 0,
            change: formatPercentage(0),
            percentage: calculatePercentage(
              reports.profitLoss.expenses,
              reports.profitLoss.revenue
            )
          },
          { 
            metric: "Net Income", 
            currentPeriod: reports.profitLoss.netIncome,
            previousPeriod: reports.profitLoss.previousPeriodNetIncome,
            change: formatChange(
              reports.profitLoss.netIncome,
              reports.profitLoss.previousPeriodNetIncome
            ),
            percentage: calculatePercentage(
              reports.profitLoss.netIncome,
              reports.profitLoss.revenue
            ),
            isTotal: true
          }
        ];

      case "balanceSheet":
        return [
          { 
            metric: "Total Assets", 
            amount: reports.balanceSheet.totalAssets,
            percentOfAssets: "100%",
            structure: formatPercentage(1),
            isHeader: true
          },
          { 
            metric: "Current Assets", 
            amount: reports.balanceSheet.currentAssets,
            percentOfAssets: calculatePercentage(
              reports.balanceSheet.currentAssets,
              reports.balanceSheet.totalAssets
            ),
            structure: calculatePercentage(
              reports.balanceSheet.currentAssets,
              reports.balanceSheet.totalAssets
            ),
            indent: true
          },
          { 
            metric: "Fixed Assets", 
            amount: reports.balanceSheet.fixedAssets,
            percentOfAssets: calculatePercentage(
              reports.balanceSheet.fixedAssets,
              reports.balanceSheet.totalAssets
            ),
            structure: calculatePercentage(
              reports.balanceSheet.fixedAssets,
              reports.balanceSheet.totalAssets
            ),
            indent: true
          },
          { 
            metric: "Total Liabilities", 
            amount: reports.balanceSheet.totalLiabilities,
            percentOfAssets: calculatePercentage(
              reports.balanceSheet.totalLiabilities,
              reports.balanceSheet.totalAssets
            ),
            structure: "100%",
            isHeader: true
          },
          { 
            metric: "Current Liabilities", 
            amount: reports.balanceSheet.currentLiabilities,
            percentOfAssets: calculatePercentage(
              reports.balanceSheet.currentLiabilities,
              reports.balanceSheet.totalAssets
            ),
            structure: calculatePercentage(
              reports.balanceSheet.currentLiabilities,
              reports.balanceSheet.totalLiabilities
            ),
            indent: true
          },
          { 
            metric: "Long-term Liabilities", 
            amount: reports.balanceSheet.longTermLiabilities,
            percentOfAssets: calculatePercentage(
              reports.balanceSheet.longTermLiabilities,
              reports.balanceSheet.totalAssets
            ),
            structure: calculatePercentage(
              reports.balanceSheet.longTermLiabilities,
              reports.balanceSheet.totalLiabilities
            ),
            indent: true
          },
          { 
            metric: "Total Equity", 
            amount: reports.balanceSheet.totalEquity,
            percentOfAssets: calculatePercentage(
              reports.balanceSheet.totalEquity,
              reports.balanceSheet.totalAssets
            ),
            structure: formatPercentage(1),
            isTotal: true
          }
        ];

      case "cashFlow":
        return [
          { 
            metric: "Beginning Cash", 
            amount: reports.cashFlow.beginningCash,
            percentage: calculatePercentage(
              reports.cashFlow.beginningCash,
              Math.abs(reports.cashFlow.operatingCash)
            )
          },
          { 
            metric: "Operating Cash Flow", 
            amount: reports.cashFlow.operatingCash,
            percentage: "100%"
          },
          { 
            metric: "Investing Cash Flow", 
            amount: reports.cashFlow.investingCash,
            percentage: calculatePercentage(
              reports.cashFlow.investingCash,
              Math.abs(reports.cashFlow.operatingCash)
            )
          },
          { 
            metric: "Financing Cash Flow", 
            amount: reports.cashFlow.financingCash,
            percentage: calculatePercentage(
              reports.cashFlow.financingCash,
              Math.abs(reports.cashFlow.operatingCash)
            )
          },
          { 
            metric: "Free Cash Flow", 
            amount: reports.cashFlow.freeCashFlow,
            percentage: calculatePercentage(
              reports.cashFlow.freeCashFlow,
              Math.abs(reports.cashFlow.operatingCash)
            ),
            isTotal: true
          },
          { 
            metric: "Ending Cash", 
            amount: reports.cashFlow.endingCash,
            percentage: calculatePercentage(
              reports.cashFlow.endingCash,
              Math.abs(reports.cashFlow.operatingCash)
            ),
            isTotal: true
          },
          { 
            metric: "Cash Ratio", 
            amount: formatPercentage(reports.cashFlow.cashRatio),
            percentage: "-"
          }
        ];
        
      default:
        return [];
    }
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
      <DataTable
        columns={[
          { 
            key: "metric", 
            label: "Metrics", 
            width: "25%", 
            render: (row) => (
              <div className={`${row.isTotal ? "font-bold" : ""}`}>
                {row.metric}
              </div>
            )
          },
          { 
            key: "currentPeriod", 
            label: "Current Period", 
            width: "25%", 
            render: (row) => (
              <div className={`text-right ${row.isTotal ? "font-bold" : ""}`}>
                {formatCurrency(row.currentPeriod)}
              </div>
            ) 
          },
          { 
            key: "previousPeriod", 
            label: "Previous Period", 
            width: "25%", 
            render: (row) => (
              <div className={`text-right ${row.isTotal ? "font-bold" : ""}`}>
                {formatCurrency(row.previousPeriod)}
              </div>
            ) 
          },
          { 
            key: "change", 
            label: "Change %", 
            width: "12.5%", 
            render: (row) => (
              <div className={`text-right ${row.isTotal ? "font-bold" : ""}`}>
                {row.change}
              </div>
            ) 
          },
          { 
            key: "percentage", 
            label: "% of Revenue", 
            width: "12.5%", 
            render: (row) => (
              <div className={`text-right ${row.isTotal ? "font-bold" : ""}`}>
                {row.percentage}
              </div>
            ) 
          }
        ]}
        data={convertReportToTableData("profitLoss")}
      />
    </div>
  );

  const renderBalanceSheetTable = () => (
    <div className="overflow-x-auto">
      <DataTable
        columns={[
          { 
            key: "metric", 
            label: "Metrics", 
            width: "25%", 
            render: (row) => (
              <div className={`${row.isHeader ? "font-semibold bg-gray-50" : ""} ${row.isTotal ? "font-bold" : ""} ${row.indent ? "pl-8" : ""}`}>
                {row.metric}
              </div>
            )
          },
          { 
            key: "amount", 
            label: "Amount", 
            width: "25%", 
            render: (row) => (
              <div className={`text-right ${row.isHeader ? "font-semibold bg-gray-50" : ""} ${row.isTotal ? "font-bold" : ""}`}>
                {typeof row.amount === 'string' ? row.amount : formatCurrency(row.amount)}
              </div>
            ) 
          },
          { 
            key: "percentOfAssets", 
            label: "% of Total Assets", 
            width: "25%", 
            render: (row) => (
              <div className={`text-right ${row.isHeader ? "font-semibold bg-gray-50" : ""} ${row.isTotal ? "font-bold" : ""}`}>
                {row.percentOfAssets}
              </div>
            ) 
          },
          { 
            key: "structure", 
            label: "Structure %", 
            width: "25%", 
            render: (row) => (
              <div className={`text-right ${row.isHeader ? "font-semibold bg-gray-50" : ""} ${row.isTotal ? "font-bold" : ""}`}>
                {row.structure}
              </div>
            ) 
          }
        ]}
        data={convertReportToTableData("balanceSheet")}
      />
    </div>
  );

  const renderCashFlowTable = () => (
    <div className="overflow-x-auto">
      <DataTable
        columns={[
          { 
            key: "metric", 
            label: "Metrics", 
            width: "40%", 
            render: (row) => (
              <div className={`${row.isTotal ? "font-bold" : ""}`}>
                {row.metric}
              </div>
            )
          },
          { 
            key: "amount", 
            label: "Amount", 
            width: "30%", 
            render: (row) => (
              <div className={`text-right ${row.isTotal ? "font-bold" : ""}`}>
                {typeof row.amount === 'string' ? row.amount : formatCurrency(row.amount)}
              </div>
            ) 
          },
          { 
            key: "percentage", 
            label: "% of Operating Cash", 
            width: "30%", 
            render: (row) => (
              <div className={`text-right ${row.isTotal ? "font-bold" : ""}`}>
                {row.percentage}
              </div>
            ) 
          }
        ]}
        data={convertReportToTableData("cashFlow")}
      />
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
