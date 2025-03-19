"use client";

import React, { useState, useEffect, useCallback } from 'react';
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

const ClientTab = () => {
  const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [websocket, setWebsocket] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
    const [form] = Form.useForm();
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [isReconnecting, setIsReconnecting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Setup WebSocket connection with reconnection logic
  const setupWebSocket = useCallback(() => {
    if (isReconnecting) return;
    
    setIsReconnecting(true);
    const ws = new WebSocket('ws://localhost:5001');
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      setIsReconnecting(false);
      
      // Send a ping every 30 seconds to keep the connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'PING' }));
        }
      }, 30000);
      
      // Store the interval ID for cleanup
      ws.pingInterval = pingInterval;
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'INITIAL_DATA':
            // Transform backend data to match our frontend structure
            const transformedData = message.data.map(client => ({
              id: client.user_id,
              name: client.username || '',
              type: client.client_type || 'Individual',
              contact: client.email || '',
              address: client.address || '',
              phone: client.phone || '',
              openTime: client.open_time || '9:00 AM - 5:00 PM',
              status: client.status || 'active',
              remark: client.remark || ''
            }));
            setClients(transformedData);
            setLoading(false);
            break;
          case 'UPDATE':
            handleClientUpdate(message.data);
            break;
          case 'DELETE':
            handleClientDelete(message.data.userId || message.data.user_id);
            break;
          case 'CREATE':
            handleClientCreate(message.data);
            break;
          case 'ERROR':
            notification.error({
              message: 'Operation Failed',
              description: message.message || 'An error occurred during the operation'
            });
            break;
          case 'PONG':
            // Handle server pong response if needed
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
      notification.error({
        message: 'Connection Error',
        description: 'Failed to connect to the server. Will try to reconnect automatically.'
      });
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionStatus('disconnected');
      
      // Clear the ping interval
      if (ws.pingInterval) {
        clearInterval(ws.pingInterval);
      }
      
      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts < 5) {
        const timeout = Math.min(1000 * (2 ** reconnectAttempts), 30000);
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          setIsReconnecting(false);
          setupWebSocket();
        }, timeout);
      } else {
        notification.error({
          message: 'Connection Lost',
          description: 'Failed to reconnect to the server. Please refresh the page.'
        });
        setIsReconnecting(false);
      }
    };
    
    setWebsocket(ws);
    
    return ws;
  }, [reconnectAttempts, isReconnecting]);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = setupWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [setupWebSocket]);

  // Manual reconnect function
  const handleReconnect = () => {
    if (websocket) {
      websocket.close();
    }
    setReconnectAttempts(0);
    setIsReconnecting(false);
    setupWebSocket();
  };

    const columns = [
        {
            title: 'Client',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
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
                        <div className="text-sm font-medium text-gray-900">{text}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
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
        },
        {
            title: 'Contact',
            dataIndex: 'contact',
            key: 'contact',
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
        },
        {
            title: 'Open Time',
            dataIndex: 'openTime',
            key: 'openTime',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (text) => (
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    text === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {text}
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
        setEditingClient(client);
        form.setFieldsValue({
            username: client.name,
            email: client.contact,
            phone: client.phone,
            address: client.address,
            type: client.type,
            openTime: client.openTime,
            status: client.status,
            remark: client.remark
        });
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (websocket && websocket.readyState === WebSocket.OPEN) {
                const data = {
                    type: editingClient ? 'UPDATE' : 'CREATE',
                    userId: editingClient?.id,
                    username: values.username,
                    email: values.email,
                    phone: values.phone,
                    address: values.address,
                    client_type: values.type,
                    open_time: values.openTime,
                    status: values.status,
                    remark: values.remark
                };
                
                websocket.send(JSON.stringify(data));
                setIsModalVisible(false);
                form.resetFields();
                setEditingClient(null);
                
                // Optimistic update for better UX
                if (editingClient) {
                    setClients(prevClients =>
                        prevClients.map(client => {
                            if (client.id === editingClient.id) {
                                return {
                                    ...client,
                                    name: values.username,
                                    contact: values.email,
                                    phone: values.phone,
                                    address: values.address,
                                    type: values.type,
                                    openTime: values.openTime,
                                    status: values.status,
                                    remark: values.remark
                                };
                            }
                            return client;
                        })
                    );
                } else {
                    // For new clients, we'll wait for the server to send the CREATE event with the ID
                    setLoading(true);
                }
            } else {
                notification.error({
                    message: 'Connection Lost',
                    description: 'Connection to server lost. Please try reconnecting.'
                });
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleClientUpdate = (updatedClient) => {
        setClients(prevClients =>
            prevClients.map(client => {
                if (client.id === updatedClient.userId || 
                    client.id === updatedClient.user_id) {
                    return {
                        ...client,
                        name: updatedClient.username || client.name,
                        contact: updatedClient.email || client.contact,
                        phone: updatedClient.phone || client.phone,
                        status: updatedClient.status || client.status,
                        address: updatedClient.address || client.address,
                        openTime: updatedClient.open_time || client.openTime,
                        remark: updatedClient.remark || client.remark,
                        type: updatedClient.client_type || client.type
                    };
                }
                return client;
            })
        );
        message.success('Client updated successfully');
    };

    const handleClientDelete = (userId) => {
        setClients(prevClients =>
            prevClients.filter(client => client.id !== userId)
        );
        message.success('Client deleted successfully');
    };

    const handleClientCreate = (newClient) => {
        const transformedClient = {
            id: newClient.user_id || newClient.userId,
            name: newClient.username || '',
            type: newClient.client_type || 'Individual',
            contact: newClient.email || '',
            address: newClient.address || '',
            phone: newClient.phone || '',
            openTime: newClient.open_time || '9:00 AM - 5:00 PM',
            status: newClient.status || 'active',
            remark: newClient.remark || ''
        };
        setClients(prevClients => [...prevClients, transformedClient]);
        setLoading(false);
        message.success('Client created successfully');
    };

    const handleDelete = (userId) => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({
                type: 'DELETE',
                userId: userId
            }));
            
            // Optimistic update
            setClients(prevClients => 
                prevClients.filter(client => client.id !== userId)
            );
        } else {
            notification.error({
                message: 'Connection Lost',
                description: 'Connection to server lost. Please try reconnecting.'
            });
        }
    };

  // Filter client list
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.contact && client.contact.toLowerCase().includes(searchTerm.toLowerCase()));
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
            {/* Title and connection status */}
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Clients</h2>
                <div className="flex items-center">
                    <span className="mr-2">
                        Status: 
                        <span className={`ml-1 ${
                            connectionStatus === 'connected' ? 'text-green-600' : 
                            connectionStatus === 'connecting' ? 'text-yellow-600' : 
                            'text-red-600'
                        }`}>
                            {connectionStatus === 'connected' ? 'Connected' : 
                             connectionStatus === 'connecting' ? 'Connecting...' : 
                             'Disconnected'}
                        </span>
                    </span>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={handleReconnect}
                        disabled={connectionStatus === 'connected' || isReconnecting}
                    >
                        {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
                    </Button>
                </div>
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
                            openTime: '9:00 AM - 5:00 PM'
                        });
                        setIsModalVisible(true);
                    }}
                    disabled={connectionStatus !== 'connected'}
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
                        emptyText: connectionStatus !== 'connected' ? 
                            'Connection to server lost. Please reconnect.' : 
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
                okButtonProps={{ disabled: connectionStatus !== 'connected' }}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="Name"
                        rules={[{ required: true, message: 'Please input client name!' }]}
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
                        name="address"
                        label="Address"
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
                        name="openTime"
                        label="Open Time"
                        initialValue="9:00 AM - 5:00 PM"
                    >
                        <Input />
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
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
  );
};

export default ClientTab;
