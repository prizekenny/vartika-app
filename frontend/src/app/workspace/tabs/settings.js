"use client";

import React, { useState } from 'react';
import {
  FaBell,
  FaDatabase,
  FaShieldAlt,
  FaTools,
  FaPlug,
  FaEnvelope,
  FaKey,
  FaMobile,
  FaSync,
  FaCog,
  FaBook,
  FaRobot,
  FaTruck,
  FaToggleOn,
  FaToggleOff,
  FaDownload,
  FaHistory,
  FaClock
} from 'react-icons/fa';

const SettingsTab = () => {
  // 控制当前选中的模块
  const [activeModule, setActiveModule] = useState('notification');
  
  // 开关状态
  const [toggleStates, setToggleStates] = useState({
    systemUpdates: true,
    message: true,
    email: true,
    contractExpiration: true,
    automaticBackup: true,
    manualBackup: true,
    backupHistory: true,
    storageSettings: true,
    password: true,
    twoStep: true,
    recoveryEmail: true,
    websiteMaintenance: true,
    watchEmail: true,
    quickBooks: true,
    karbonAI: true,
    eCourier: true
  });

  // 备份设置状态
  const [backupSettings, setBackupSettings] = useState({
    frequency: 'daily',
    time: '00:00',
    retentionDays: 30,
    storageLocation: 'local'
  });

  // 处理开关变更
  const handleToggle = (id) => {
    setToggleStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 处理备份设置变更
  const handleBackupSettingChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // 触发手动备份
  const handleManualBackup = () => {
    console.log('Starting manual backup...');
    // 这里添加实际的备份逻辑
  };

  // 设置模块数据
  const settingsModules = [
    {
      id: 'notification',
      title: 'Notification',
      icon: <FaBell className="text-purple-500" />,
      subModules: [
        { 
          id: 'systemUpdates', 
          title: 'System Updates', 
          description: 'Get notified about system updates and new features',
          enabled: toggleStates.systemUpdates
        },
        { 
          id: 'message', 
          title: 'Message', 
          description: 'Configure in-app message notifications',
          enabled: toggleStates.message
        },
        { 
          id: 'email', 
          title: 'Email', 
          description: 'Manage email notification preferences',
          enabled: toggleStates.email
        },
        { 
          id: 'contractExpiration', 
          title: 'Contract Expiration', 
          description: 'Set alerts for contract expiration dates',
          enabled: toggleStates.contractExpiration
        }
      ]
    },
    {
      id: 'dataBackup',
      title: 'Data Backup',
      icon: <FaDatabase className="text-blue-500" />,
      subModules: [
        {
          id: 'automaticBackup',
          title: 'Automatic Backup',
          description: 'Configure automatic database backup schedule',
          enabled: toggleStates.automaticBackup,
          controls: (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span>Backup Frequency</span>
                <select
                  value={backupSettings.frequency}
                  onChange={(e) => handleBackupSettingChange('frequency', e.target.value)}
                  className="border rounded-lg px-3 py-1"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Backup Time</span>
                <input
                  type="time"
                  value={backupSettings.time}
                  onChange={(e) => handleBackupSettingChange('time', e.target.value)}
                  className="border rounded-lg px-3 py-1"
                />
              </div>
            </div>
          )
        },
        {
          id: 'manualBackup',
          title: 'Manual Backup',
          description: 'Create and manage manual database backups',
          enabled: toggleStates.manualBackup,
          controls: (
            <div className="mt-4">
              <button
                onClick={handleManualBackup}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <FaDownload />
                <span>Start Backup Now</span>
              </button>
            </div>
          )
        },
        {
          id: 'backupHistory',
          title: 'Backup History',
          description: 'View and restore from previous backups',
          enabled: toggleStates.backupHistory,
          controls: (
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <FaHistory />
                  <span>Last backup: Today at 03:00 AM</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <FaClock />
                  <span>Next scheduled: Tomorrow at 03:00 AM</span>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'storageSettings',
          title: 'Storage Settings',
          description: 'Configure backup storage locations and retention',
          enabled: toggleStates.storageSettings,
          controls: (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span>Storage Location</span>
                <select
                  value={backupSettings.storageLocation}
                  onChange={(e) => handleBackupSettingChange('storageLocation', e.target.value)}
                  className="border rounded-lg px-3 py-1"
                >
                  <option value="local">Local Storage</option>
                  <option value="cloud">Cloud Storage</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Retention Period (days)</span>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={backupSettings.retentionDays}
                  onChange={(e) => handleBackupSettingChange('retentionDays', e.target.value)}
                  className="border rounded-lg px-3 py-1 w-24"
                />
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'security',
      title: 'Security',
      icon: <FaShieldAlt className="text-green-500" />,
      subModules: [
        {
          id: 'password',
          title: 'Password',
          description: 'Manage password requirements and policies',
          enabled: toggleStates.password,
          controls: (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span>Minimum Length</span>
                <select
                  className="border rounded-lg px-3 py-1"
                  defaultValue="8"
                >
                  <option value="6">6 characters</option>
                  <option value="8">8 characters</option>
                  <option value="10">10 characters</option>
                  <option value="12">12 characters</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Require Numbers</span>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Require Special Characters</span>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Require Uppercase Letters</span>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Password Expiry</span>
                <select
                  className="border rounded-lg px-3 py-1"
                  defaultValue="90"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          )
        },
        {
          id: 'twoStep',
          title: '2-Step Verification',
          description: 'Set up two-factor authentication',
          enabled: toggleStates.twoStep,
          controls: (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span>Verification Method</span>
                <select
                  className="border rounded-lg px-3 py-1"
                  defaultValue="app"
                >
                  <option value="app">Authenticator App</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Remember Device</span>
                <select
                  className="border rounded-lg px-3 py-1"
                  defaultValue="30"
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Configure 2-Step Verification
              </button>
            </div>
          )
        },
        {
          id: 'recoveryEmail',
          title: 'Recovery Email',
          description: 'Configure account recovery options',
          enabled: toggleStates.recoveryEmail,
          controls: (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Recovery Email Address</label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter recovery email"
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    Verify
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Status: <span className="text-yellow-500">Pending Verification</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recovery Code</span>
                <button className="px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-50">
                  Generate New Code
                </button>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      icon: <FaTools className="text-orange-500" />,
      subModules: [
        { 
          id: 'websiteMaintenance', 
          title: 'Website Maintenance', 
          description: 'Schedule and manage website maintenance',
          enabled: toggleStates.websiteMaintenance
        }
      ]
    },
    {
      id: 'apiManagement',
      title: 'API Management',
      icon: <FaPlug className="text-red-500" />,
      subModules: [
        { 
          id: 'watchEmail', 
          title: 'Watch Email',
          description: 'Configure email monitoring API settings',
          enabled: toggleStates.watchEmail,
          controls: (
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="min-w-[100px]">API Key</span>
                <input
                  type="password"
                  placeholder="Enter API Key"
                  className="flex-1 border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )
        },
        { 
          id: 'quickBooks', 
          title: 'Quick Books',
          description: 'Manage QuickBooks integration settings',
          enabled: toggleStates.quickBooks,
          controls: (
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="min-w-[100px]">Client ID</span>
                <input
                  type="password"
                  placeholder="Enter Client ID"
                  className="flex-1 border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )
        },
        { 
          id: 'karbonAI', 
          title: 'Karbon AI',
          description: 'Set up Karbon AI API configuration',
          enabled: toggleStates.karbonAI,
          controls: (
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="min-w-[100px]">API Token</span>
                <input
                  type="password"
                  placeholder="Enter API Token"
                  className="flex-1 border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )
        },
        { 
          id: 'eCourier', 
          title: 'E-Courier',
          description: 'Configure E-Courier service integration',
          enabled: toggleStates.eCourier,
          controls: (
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="min-w-[100px]">API Key</span>
                <input
                  type="password"
                  placeholder="Enter API Key"
                  className="flex-1 border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )
        }
      ]
    }
  ];

  return (
    <div className="p-6">
      {/* 标题 */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      </div>

      {/* 主模块导航 */}
      <div className="flex space-x-4 mb-8">
        {settingsModules.map(module => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={`flex flex-col items-center p-4 rounded-lg transition-all ${
              activeModule === module.id
                ? 'bg-purple-100 text-purple-600'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="text-2xl mb-2">{module.icon}</div>
            <span className="text-sm font-medium">{module.title}</span>
          </button>
        ))}
      </div>

      {/* 子模块内容 */}
      {settingsModules.find(m => m.id === activeModule) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid gap-4">
            {settingsModules
              .find(m => m.id === activeModule)
              .subModules.map(subModule => (
                <div
                  key={subModule.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{subModule.title}</h4>
                    <button
                      onClick={() => handleToggle(subModule.id)}
                      className={`text-2xl ${subModule.enabled ? 'text-purple-600' : 'text-gray-400'}`}
                    >
                      {subModule.enabled ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {subModule.description}
                  </p>
                  {subModule.enabled && subModule.controls && (
                    <div className="border-t mt-4 pt-4">
                      {subModule.controls}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
