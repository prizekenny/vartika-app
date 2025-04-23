-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS log_types CASCADE;
DROP TABLE IF EXISTS log_statuses CASCADE;
DROP TABLE IF EXISTS api_tokens;
DROP TABLE IF EXISTS google_drive_tokens CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    phone VARCHAR(20),
    auth_provider VARCHAR(20), -- 'local', 'google', 'microsoft', 'facebook'
    auth_provider_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    user_type VARCHAR(20) DEFAULT 'Client',
    last_login_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles table
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Permissions table
CREATE TABLE permissions (
    permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    scope VARCHAR(50)
);

-- Role_Permissions junction table
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(role_id),
    permission_id UUID REFERENCES permissions(permission_id),
    PRIMARY KEY (role_id, permission_id)
);

-- User_Roles junction table
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(user_id),
    role_id UUID REFERENCES roles(role_id),
    PRIMARY KEY (user_id, role_id)
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    client_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    company_name VARCHAR(100),
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    address TEXT,
    client_type VARCHAR(50),
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Insert default roles
INSERT INTO roles (role_name) VALUES 
    ('SuperAdmin'),
    ('Admin'),
    ('Employee'),
    ('Client'),
    ('Guest');

CREATE TABLE contracts (
    contract_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Accept', 'Pending', 'Active', 'Expired')) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Log Types table
CREATE TABLE log_types (
    type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Log Statuses table
CREATE TABLE log_statuses (
    status_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_name VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs table
CREATE TABLE activity_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP NOT NULL,
    log_name VARCHAR(100) NOT NULL,
    description TEXT,
    log_type_id UUID REFERENCES log_types(type_id),
    status_id UUID REFERENCES log_statuses(status_id),
    user_id UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- API Tokens table

CREATE TABLE api_tokens (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,  -- User's email (can repeat for different platforms)
    platform VARCHAR(50) NOT NULL,     -- e.g., "gmail", "google_drive", "quickbooks"
    access_token TEXT,                 -- ⚠️ Nullable: May expire
    refresh_token TEXT NOT NULL,        -- ✅ Always required for renewal
    realm_id VARCHAR(50),  -- 🆕 QuickBooks Realm ID (only used for QuickBooks)
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- When access_token expires
    last_refreshed TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Last refresh timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_platform UNIQUE (user_email, platform) -- 🚀 Ensures one token per platform
);


-- Create indexes for better query performance
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_activity_logs_type ON activity_logs(log_type_id);
CREATE INDEX idx_activity_logs_status ON activity_logs(status_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);

-- Add comments to the tables
COMMENT ON TABLE activity_logs IS 'Stores system-wide activity logs including sync, security, and file operations';
COMMENT ON TABLE log_types IS 'Stores predefined types of log entries';
COMMENT ON TABLE log_statuses IS 'Stores predefined status values for log entries';

-- Insert predefined log types
INSERT INTO log_types (type_name, description) VALUES 
    ('System Alert', 'System-level alerts and notifications'),
    ('File Operation', 'File-related activities like upload, download, and delete'),
    ('System Sync', 'Data synchronization activities'),
    ('Security', 'Security-related events like login and logout'),
    ('System Operation', 'General system operations');

-- Insert predefined log statuses
INSERT INTO log_statuses (status_name, description) VALUES 
    ('Success', 'Operation completed successfully'),
    ('Warning', 'Operation completed with warnings'),
    ('Error', 'Operation failed or encountered errors');

-- Uploaded Files table to track Google Drive uploaded documents
DROP TABLE IF EXISTS uploaded_files CASCADE;

CREATE TABLE uploaded_files (
    file_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    google_drive_file_id VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES users(user_id),
    file_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster file queries by user
CREATE INDEX idx_uploaded_files_user ON uploaded_files(uploaded_by);

COMMENT ON TABLE uploaded_files IS 'Stores metadata for files uploaded to Google Drive';

-- 添加来自02_google_drive_tables.sql的表

-- 创建Google Drive令牌表
CREATE TABLE IF NOT EXISTS google_drive_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 创建文件表
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    file_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    description TEXT,
    web_view_link TEXT,
    thumbnail_link TEXT,
    created_time TIMESTAMP WITH TIME ZONE,
    folder_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, file_id)
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_google_drive_tokens_user_id ON google_drive_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_file_id ON files(file_id);


