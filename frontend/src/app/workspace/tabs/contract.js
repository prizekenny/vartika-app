"use client";

import React, { useState, useEffect } from "react";
import Pagination from "../../../components/common/Pagination";
import {
  FaFileContract,
  FaBuilding,
  FaChartPie,
  FaMapMarkerAlt,
  FaBell,
  FaDollarSign,
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlus,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DataTable from "../../../components/common/DataTable";

// 定义图表颜色
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const ContractTab = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState("overview");

  // State management
  const [contractData, setContractData] = useState({
    overview: {
      draftContracts: { count: 0, total: 0, percentage: 0 },
      newBusinesses: { count: 0, total: 0, percentage: 0 },
      ongoingContracts: { count: 0, total: 0, percentage: 0 },
    },
    clientTypes: [],
    locations: [],
    reminders: [],
    topClients: [],
    contracts: [],
  });

  // 添加即将到期合同的状态
  const [expiringContracts, setExpiringContracts] = useState([]);

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    amount: "",
    start_date: "",
    expiration_date: "",
    status: "Pending",
    user_id: "",
  });

  // 添加用户列表状态
  const [users, setUsers] = useState([]);

  // 添加高价值客户状态
  const [topValueClients, setTopValueClients] = useState([]);

  // 添加合同金额分布状态
  const [amountDistribution, setAmountDistribution] = useState([]);

  // 添加状态分布状态
  const [statusDistribution, setStatusDistribution] = useState([]);

  // API base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  // Fetch contracts
  const fetchContracts = async (page = 1, search = "") => {
    try {
      setLoading(true);
      console.log("开始获取合同列表:", { page, search });

      const url = `${API_URL}/api/contracts?page=${page}&limit=10${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`;
      console.log("请求URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("获取合同列表失败");
      }

      const data = await response.json();
      console.log("服务器返回数据:", data);

      setContractData((prev) => ({
        ...prev,
        contracts: data.contracts || [],
      }));
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || 1);

      console.log("更新状态:", {
        currentPage: data.page,
        totalPages: data.totalPages,
        contractsCount: data.contracts?.length,
      });
    } catch (error) {
      console.error("获取合同列表出错:", error);
      setContractData((prev) => ({
        ...prev,
        contracts: [],
      }));
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      if (!response.ok) {
        throw new Error("获取用户列表失败");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("获取用户列表出错:", error);
    }
  };

  // 在组件加载时获取用户列表
  useEffect(() => {
    fetchUsers();
  }, []);

  // 获取即将到期的合同
  const fetchExpiringContracts = async () => {
    try {
      console.log("开始获取即将到期合同，API_URL:", API_URL);
      const url = `${API_URL}/api/contracts/expiring/soon`;
      console.log("请求URL:", url);

      const response = await fetch(url);
      console.log("响应状态:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("服务器返回错误:", errorData);
        throw new Error(
          `获取即将到期合同失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("获取到的数据:", data);
      setExpiringContracts(data);
    } catch (error) {
      console.error("获取即将到期合同出错:", error);
      setExpiringContracts([]); // 出错时设置为空数组
    }
  };

  // 获取高价值客户
  const fetchTopValueClients = async () => {
    try {
      console.log("Starting to fetch top value clients");
      const url = `${API_URL}/api/contracts/clients/top-value`;
      console.log("Request URL:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server returned error:", errorData);
        throw new Error(
          `Failed to fetch top value clients: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Received data:", data);
      setTopValueClients(data);
    } catch (error) {
      console.error("Error fetching top value clients:", error);
      setTopValueClients([]); // Set empty array on error
    }
  };

  // 添加获取进行中合同统计的函数
  const fetchActiveContractsStats = async () => {
    try {
      console.log("开始获取进行中合同统计");
      const url = `${API_URL}/api/contracts/stats/active`;
      console.log("请求URL:", url);

      const response = await fetch(url);
      console.log("响应状态:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("服务器返回错误:", errorData);
        throw new Error(
          `获取进行中合同统计失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("获取到的数据:", data);

      setContractData((prev) => ({
        ...prev,
        overview: {
          ...prev.overview,
          ongoingContracts: {
            count: data.count,
            percentage: data.percentage,
          },
        },
      }));
    } catch (error) {
      console.error("获取进行中合同统计出错:", error);
      setContractData((prev) => ({
        ...prev,
        overview: {
          ...prev.overview,
          ongoingContracts: {
            count: 0,
            percentage: 0,
          },
        },
      }));
    }
  };

  // 添加获取草稿合同统计的函数
  const fetchDraftContractsStats = async () => {
    try {
      console.log("开始获取草稿合同统计");
      const url = `${API_URL}/api/contracts/stats/draft`;
      console.log("请求URL:", url);

      const response = await fetch(url);
      console.log("响应状态:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("服务器返回错误:", errorData);
        throw new Error(
          `获取草稿合同统计失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("获取到的数据:", data);

      setContractData((prev) => ({
        ...prev,
        overview: {
          ...prev.overview,
          draftContracts: {
            count: data.count,
            percentage: data.percentage,
          },
        },
      }));
    } catch (error) {
      console.error("获取草稿合同统计出错:", error);
      setContractData((prev) => ({
        ...prev,
        overview: {
          ...prev.overview,
          draftContracts: {
            count: 0,
            percentage: 0,
          },
        },
      }));
    }
  };

  // 添加获取新业务统计的函数
  const fetchNewBusinessesStats = async () => {
    try {
      console.log("开始获取新业务统计");
      const url = `${API_URL}/api/contracts/stats/new-businesses`;
      console.log("请求URL:", url);

      const response = await fetch(url);
      console.log("响应状态:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("服务器返回错误:", errorData);
        throw new Error(
          `获取新业务统计失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("获取到的数据:", data);

      setContractData((prev) => ({
        ...prev,
        overview: {
          ...prev.overview,
          newBusinesses: {
            count: data.count,
            percentage: data.percentage,
          },
        },
      }));
    } catch (error) {
      console.error("获取新业务统计出错:", error);
      setContractData((prev) => ({
        ...prev,
        overview: {
          ...prev.overview,
          newBusinesses: {
            count: 0,
            percentage: 0,
          },
        },
      }));
    }
  };

  // 添加获取合同金额分布的函数
  const fetchAmountDistribution = async () => {
    try {
      console.log("开始获取合同金额分布统计");
      const url = `${API_URL}/api/contracts/stats/amount-distribution`;
      console.log("请求URL:", url);

      const response = await fetch(url);
      console.log("响应状态:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("服务器返回错误:", errorData);
        throw new Error(
          `获取合同金额分布统计失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("获取到的数据:", data);

      // 确保所有区间都存在
      const categories = ["Low", "Medium Low", "Medium", "Medium High", "High"];
      const fullData = categories.map((category) => {
        const found = data.find((item) => item.name === category);
        return (
          found || {
            name: category,
            value: 0,
            avgAmount: 0,
            minAmount: 0,
            maxAmount: 0,
            isEmpty: true,
          }
        );
      });

      setAmountDistribution(fullData);
    } catch (error) {
      console.error("获取合同金额分布统计出错:", error);
      // 设置默认的空数据结构
      const emptyData = [
        "Low",
        "Medium Low",
        "Medium",
        "Medium High",
        "High",
      ].map((category) => ({
        name: category,
        value: 0,
        avgAmount: 0,
        minAmount: 0,
        maxAmount: 0,
        isEmpty: true,
      }));
      setAmountDistribution(emptyData);
    }
  };

  // 添加获取合同状态分布的函数
  const fetchStatusDistribution = async () => {
    try {
      console.log("开始获取合同状态分布统计");
      const url = `${API_URL}/api/contracts/stats/status-distribution`;
      console.log("请求URL:", url);

      const response = await fetch(url);
      console.log("响应状态:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("服务器返回错误:", errorData);
        throw new Error(
          `获取合同状态分布统计失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("获取到的数据:", data);
      setStatusDistribution(data);
    } catch (error) {
      console.error("获取合同状态分布统计出错:", error);
      setStatusDistribution([]);
    }
  };

  // 在组件加载和 tab 切换时获取数据
  useEffect(() => {
    if (activeTab === "overview") {
      fetchExpiringContracts();
      fetchTopValueClients();
      fetchActiveContractsStats();
      fetchDraftContractsStats();
      fetchNewBusinessesStats();
      fetchAmountDistribution();
      fetchStatusDistribution();
    }
  }, [activeTab]);

  // Handle contract creation/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedContract
        ? `${API_URL}/api/contracts/${selectedContract.contract_id}`
        : `${API_URL}/api/contracts`;

      const method = selectedContract ? "PUT" : "POST";

      // 验证是否选择了用户
      if (!formData.user_id) {
        throw new Error("Please select a user");
      }

      // 准备提交的数据
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      // 验证日期
      const startDate = new Date(submitData.start_date);
      const endDate = new Date(submitData.expiration_date);

      if (startDate >= endDate) {
        throw new Error("Start date must be earlier than end date");
      }

      // 验证金额
      if (isNaN(submitData.amount) || submitData.amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save contract");
      }

      setShowEditModal(false);
      await fetchContracts(1, searchTerm);
      setFormData({
        subject: "",
        content: "",
        amount: "",
        start_date: "",
        expiration_date: "",
        status: "Pending",
        user_id: "",
      });
    } catch (error) {
      console.error("Error saving contract:", error);
      alert(error.message || "Error saving contract");
    }
  };

  // Handle contract deletion
  const handleDelete = async () => {
    if (!selectedContract) return;

    try {
      const response = await fetch(
        `${API_URL}/api/contracts/${selectedContract.contract_id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        fetchContracts(currentPage, searchTerm);
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
    }
  };

  // Effect for initial load and search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      console.log("搜索词变化，重置到第一页");
      setCurrentPage(1); // 重置到第一页
      fetchContracts(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle edit click
  const handleEditClick = (contract) => {
    setSelectedContract(contract);
    setFormData({
      subject: contract.subject,
      content: contract.content,
      amount: contract.amount,
      start_date: contract.start_date.split("T")[0],
      expiration_date: contract.expiration_date.split("T")[0],
      status: contract.status,
      user_id: contract.user_id,
    });
    setShowEditModal(true);
  };

  // Handle new contract click
  const handleNewContract = () => {
    setSelectedContract(null);
    setFormData({
      subject: "",
      content: "",
      amount: "",
      start_date: "",
      expiration_date: "",
      status: "Pending",
      user_id: "",
    });
    setShowEditModal(true);
  };

  // 修改分页处理
  const handlePageChange = async (newPage) => {
    if (
      newPage === currentPage ||
      loading ||
      newPage < 1 ||
      newPage > totalPages
    ) {
      console.log("页码切换被阻止:", {
        newPage,
        currentPage,
        loading,
        totalPages,
      });
      return;
    }

    try {
      console.log("开始切换到新页面:", newPage);
      await fetchContracts(newPage, searchTerm);
    } catch (error) {
      console.error("切换页面时出错:", error);
    }
  };

  return (
    <div className="p-6">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Contract Management
        </h2>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("contracts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "contracts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Contracts
            </button>
          </nav>
        </div>
      </div>

      {/* Overview page */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaFileContract className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Draft Contracts
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Contracts with pending status
                  </p>
                  <div className="mt-1">
                    <span className="text-2xl font-semibold">
                      {contractData.overview.draftContracts.count}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({contractData.overview.draftContracts.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaBuilding className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    New Businesses
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Contracts created in last 60 days
                  </p>
                  <div className="mt-1">
                    <span className="text-2xl font-semibold">
                      {contractData.overview.newBusinesses.count}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({contractData.overview.newBusinesses.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FaChartPie className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Ongoing Contracts
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Contracts with active status
                  </p>
                  <div className="mt-1">
                    <span className="text-2xl font-semibold">
                      {contractData.overview.ongoingContracts.count}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({contractData.overview.ongoingContracts.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client type distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contract Status Distribution
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Distribution of contracts by status
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={true}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, percentage }) => {
                        const RADIAN = Math.PI / 180;
                        // 增加半径，让标签显示在扇区外围
                        const radius = outerRadius * 1.1;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        // 将长文本拆分成多行，每行不超过10个字符
                        const words = name.split(' ');
                        let lines = [];
                        let currentLine = '';
                        
                        words.forEach(word => {
                          // 如果当前行加上新词和空格不超过10个字符，则添加到当前行
                          if (currentLine.length + word.length + 1 <= 10) {
                            currentLine += (currentLine ? ' ' : '') + word;
                          } else {
                            // 否则保存当前行并开始新行
                            if (currentLine) lines.push(currentLine);
                            currentLine = word;
                          }
                        });
                        
                        // 添加最后一行
                        if (currentLine) lines.push(currentLine);
                        
                        // 如果没有拆分成行，就用原文本
                        if (lines.length === 0) lines = [name];
                        
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill={COLORS[index % COLORS.length]}
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            style={{ 
                              fontSize: '12px', 
                              fontWeight: 'bold',
                              textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white'
                            }}
                          >
                            {lines.map((line, i) => (
                              <tspan 
                                key={i} 
                                x={x} 
                                dy={i === 0 ? 0 : '1.2em'} // 第一行不偏移，后续行偏移1.2em
                              >
                                {line} {i === lines.length - 1 ? `(${percentage}%)` : ''}
                              </tspan>
                            ))}
                          </text>
                        );
                      }}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} contracts (${props.payload.percentage}%)`,
                        name,
                      ]}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 10, width: '100%' }}
                      formatter={(value, entry, index) => {
                        return (
                          <span style={{ color: entry.color, wordBreak: 'break-word', width: '100%' }}>
                            {value}
                          </span>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Contract Amount Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contract Amount Distribution
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Distribution of contracts by amount range
              </p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={amountDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name, props) => {
                        if (props.payload.isEmpty) {
                          return ["No data available", "Count"];
                        }
                        if (name === "value") {
                          return [`${value} contracts`, "Count"];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => {
                        const item = amountDistribution.find(
                          (d) => d.name === label
                        );
                        if (item.isEmpty) {
                          return `${label}: No data available`;
                        }
                        return `${label}: $${item.minAmount.toLocaleString()} - $${item.maxAmount.toLocaleString()}`;
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 10, width: '100%' }}
                      formatter={(value, entry, index) => {
                        return (
                          <span style={{ color: entry.color, wordBreak: 'break-word', width: '100%' }}>
                            {value}
                          </span>
                        );
                      }}
                    />
                    <Bar
                      dataKey="value"
                      name="Contracts"
                      fill="#8884d8"
                      label={(props) => {
                        if (!props || !props.payload) {
                          return "";
                        }
                        const { value, isEmpty } = props.payload;
                        if (isEmpty) {
                          return "No data";
                        }
                        return value > 0 ? value : "";
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Reminders and top clients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract expiry reminders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Contract Expiry Reminders
                </h3>
                <FaBell className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {expiringContracts.map((contract) => (
                  <div
                    key={contract.contract_id}
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded cursor-pointer"
                    onClick={() => handleEditClick(contract)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {contract.subject}
                      </span>
                      <span className="text-xs text-gray-500">
                        {contract.username || "Unknown User"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-red-600">
                        {new Date(
                          contract.expiration_date
                        ).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Expires in {contract.days_until_expiry} days
                      </span>
                    </div>
                  </div>
                ))}
                {expiringContracts.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No contracts expiring soon
                  </div>
                )}
              </div>
            </div>

            {/* Top value clients */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Top Value Clients
                </h3>
                <FaDollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {topValueClients.map((client) => (
                  <div
                    key={client.user_id}
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {client.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {client.total_contracts} contracts
                      </span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      ${client.total_amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {topValueClients.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No client data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contracts list page */}
      {activeTab === "contracts" && (
        <div className="bg-white rounded-lg shadow">
          {/* Search and Add button */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="relative flex-1 mr-4">
              <input
                type="text"
                placeholder="Search contracts..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={handleNewContract}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaPlus className="mr-2" /> New Contract
            </button>
          </div>

          {/* Contracts table */}
          <DataTable
            columns={[
              { key: "username", label: "Name", width: "120px" },
              { key: "subject", label: "Subject", width: "180px" },
              { key: "amount", label: "Amount", width: "100px", render: (row) => 
                `$${parseFloat(row.amount).toLocaleString()}` },
              { key: "start_date", label: "Start Date", width: "120px", render: (row) => 
                new Date(row.start_date).toLocaleDateString() },
              { key: "expiration_date", label: "End Date", width: "120px", render: (row) => 
                new Date(row.expiration_date).toLocaleDateString() },
              { key: "status", label: "Status", width: "80px", render: (row) => (
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    row.status === "Accept"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {row.status}
                </span>
              )},
              { key: "actions", label: "Actions", width: "100px", render: (row) => (
                <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEditClick(row)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedContract(row);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              )}
            ]}
            data={contractData.contracts}
            onRowClick={handleEditClick}
          />

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-end border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center h-full w-full z-50">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh]">
            <div className="mt-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 40px)' }}>
              <h3 className="text-lg font-medium text-gray-900 sticky top-0 bg-white pb-2">
                {selectedContract ? "Edit Contract" : "New Contract"}
              </h3>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Select User
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) =>
                      setFormData({ ...formData, user_id: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  >
                    <option value="">Please select a user</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    rows="4"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiration_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiration_date: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accept">Accept</option>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    {selectedContract ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center h-full w-full z-50">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[90vh]">
            <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 40px)' }}>
              <h3 className="text-lg font-medium text-gray-900 mb-4 sticky top-0 bg-white pb-2">
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this contract? This action cannot
                be undone.
              </p>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTab;
