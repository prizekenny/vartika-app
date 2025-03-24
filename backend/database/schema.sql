-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to avoid conflicts)
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
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
