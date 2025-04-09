"use client";

import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    message,
    Popconfirm,
    Select,
    notification
} from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined, ReloadOutlined } from '@ant-design/icons';
import { FaSearch, FaUser, FaBuilding } from 'react-icons/fa';
import axios from 'axios';

// 配置 axios
axios.defaults.baseURL = 'http://localhost:5001';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 添加請求攔截器用於調試
axios.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

const API_BASE_URL = "http://localhost:5001/api/clients";

const ClientTab = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [form] = Form.useForm();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch clients from the API
    const fetchClients = async () => {
        setLoading(true);
        try {
            console.log('Fetching clients from:', API_BASE_URL);
            const response = await axios.get(API_BASE_URL, {
                timeout: 5000, // 設置超時時間
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('API Response:', response.data);
            
            if (response.data) {
                const transformedData = response.data.map(client => ({
                    id: client.user_id,
                    name: client.username,
                    company_name: client.company_name,
                    type: client.client_type || 'Individual',
                    email: client.email,
                    phone: client.phone,
                    status: client.status || 'active',
                    address: client.address || '',
                    openTime: new Date(client.register_time).toLocaleDateString(),
                    remark: client.remark || ''
                }));
                
                console.log('Transformed Data:', transformedData);
                setClients(transformedData);
            }
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                response: error.response,
                request: error.request
            });
            
            notification.error({
                message: '載入失敗',
                description: error.response?.data?.message || '無法連接到服務器，請稍後再試。'
            });
        } finally {
            setLoading(false);
        }
    };

    // Load clients on component mount
    useEffect(() => {
        fetchClients();
    }, []);

    const columns = [
        {
            title: 'Client',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                        {record.type === 'Individual' ? (
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <FaUser className="text-blue-500 w-4 h-4" />
                            </div>
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <FaBuilding className="text-green-500 w-4 h-4" />
                            </div>
                        )}
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                            {record.company_name || text}
                        </div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: '24',
            render: (text) => (
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    text === 'Individual' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                    {text}
                </span>
            ),
        },
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '20',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            width: '36',
        },
        {
            title: 'Open Time',
            dataIndex: 'openTime',
            key: 'openTime',
            width: '28',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '24',
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (text) => (
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    text === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {text === 'active' ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            title: 'Remark',
            dataIndex: 'remark',
            key: 'remark',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this client?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const showEditModal = (client) => {
        console.log('Editing client:', client);
        setEditingClient(client);
        form.setFieldsValue({
            username: client.name,
            email: client.email,
            phone: client.phone,
            type: client.type,
            status: client.status,
            address: client.address,
            company_name: client.company_name,
            openTime: client.openTime,
            remark: client.remark
        });
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const clientData = {
                user_id: editingClient?.id,
                username: values.username,
                email: values.email,
                phone: values.phone,
                client_type: values.type,
                status: values.status,
                address: values.address,
                company_name: values.company_name,
                remark: values.remark
            };
            
            console.log('Sending data:', clientData);
            
            if (editingClient) {
                const response = await axios.put(`${API_BASE_URL}/${editingClient.id}`, clientData);
                console.log('Update response:', response);
                if (response.status === 200) {
                    message.success("Client Updated");
                    fetchClients();
                    setIsModalVisible(false);
                    form.resetFields();
                    setEditingClient(null);
                }
            } else {
                const response = await axios.post(API_BASE_URL, clientData);
                console.log('Create response:', response);
                if (response.status === 201) {
                    message.success("New Client Created");
                    fetchClients();
                    setIsModalVisible(false);
                    form.resetFields();
                    setEditingClient(null);
                }
            }
        } catch (error) {
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            notification.error({
                message: '更新失敗',
                description: error.response?.data?.message || '更新客戶資料時發生錯誤'
            });
        }
    };

    const handleDelete = async (userId) => {
        try {
            await axios.delete(`${API_BASE_URL}/${userId}`);
            message.success("Client deleted");
            fetchClients(); // 重新載入數據
        } catch (error) {
            console.error("Error deleting client:", error);
            notification.error({
                message: 'Delete failed',
                description: error.response?.data?.message || 'Delete process failed'
            });
        }
    };

    // Filter client list
    const filteredClients = clients.filter(client => {
        const matchesSearch = 
            (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchTerm);
    };

    // Handle pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="max-w-[1400px] mx-auto p-4">
            {/* Title */}
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Clients</h2>
                <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchClients}
                >
                    Refresh
                </Button>
            </div>

            {/* Search bar */}
            <div className="mb-4">
                <form onSubmit={handleSearch} className="flex items-center max-w-md">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 pl-10 pr-4 text-sm border rounded-l-lg focus:outline-none focus:border-blue-500"
                        />
                        <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded-r-lg hover:bg-blue-600 focus:outline-none"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Client header with Add button */}
            <div className="mb-4">
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => {
                        setEditingClient(null);
                        form.resetFields();
                        form.setFieldsValue({
                            type: 'Individual',
                            status: 'active',
                            registerTime: new Date().toLocaleDateString(),
                            address: '',
                            openTime: '9:00 AM - 5:00 PM',
                            remark: ''
                        });
                        setIsModalVisible(true);
                    }}
                >
                    Add New Client
                </Button>
            </div>

            {/* Client table */}
            <div className="h-[calc(100vh-220px)] overflow-auto bg-white rounded-lg shadow">
                <Table
                    columns={columns}
                    dataSource={filteredClients}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: itemsPerPage,
                        total: filteredClients.length,
                        onChange: paginate,
                        showSizeChanger: false
                    }}
                    locale={{
                        emptyText: loading ? 
                            'Loading client data...' : 
                            'No client data available.'
                    }}
                />
            </div>

            {/* Edit/Add Modal */}
            <Modal
                title={editingClient ? "Edit Client" : "Add New Client"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setEditingClient(null);
                }}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="Name"
                        rules={[{ required: true, message: '請輸入客戶名稱！' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="company_name"
                        label="Company Name"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Type"
                        rules={[{ required: true, message: 'Please select client type!' }]}
                        initialValue="Individual"
                    >
                        <Select>
                            <Select.Option value="Individual">Individual</Select.Option>
                            <Select.Option value="Company">Company</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Contact Email"
                        rules={[
                            { required: true, message: 'Please input email!' },
                            { type: 'email', message: 'Please input valid email!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Phone"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="openTime"
                        label="Open Time"
                    >
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Status"
                        initialValue="active"
                    >
                        <Select>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="remark"
                        label="Remark"
                    >
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
  );
};

export default ClientTab;
