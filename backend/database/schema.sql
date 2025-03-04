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

-- Insert default roles
INSERT INTO roles (role_name) VALUES 
    ('SuperAdmin'),
    ('Admin'),
    ('Employee'),
    ('Client'),
    ('Guest');

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
