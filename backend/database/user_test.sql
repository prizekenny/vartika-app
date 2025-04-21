-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert default roles
INSERT INTO roles (role_name) VALUES 
    ('SuperAdmin'),
    ('Admin'),
    ('Employee'),
    ('Client'),
    ('Guest')
ON CONFLICT (role_name) DO NOTHING;

-- Insert test users
INSERT INTO users (username, email, password, phone, status, user_type) VALUES 
('johnsmith', 'john.smith@example.com', 'hashed_password', '+1 (416) 555-0123', 'active', 'SuperAdmin'),
('emmawilson', 'emma.wilson@example.com', 'hashed_password', '+1 (647) 555-0456', 'active', 'Admin'),
('michaelbrown', 'michael.brown@example.com', 'hashed_password', '+1 (905) 555-0789', 'inactive', 'Employee'),
('sarahdavis', 'sarah.davis@example.com', 'hashed_password', '+1 (289) 555-0321', 'active', 'Client'),
('davidtaylor', 'david.taylor@example.com', 'hashed_password', '+1 (416) 555-0147', 'banned', 'Client')
ON CONFLICT (email) DO NOTHING;

-- Bulk insert users (testing API support)
INSERT INTO users (username, email, password, phone, status, user_type) VALUES 
('alicejohnson', 'alice.johnson@example.com', 'hashed_password', '+1 (647) 555-0912', 'active', 'Employee'),
('brianwalker', 'brian.walker@example.com', 'hashed_password', '+1 (416) 555-0333', 'active', 'Client')
ON CONFLICT (email) DO NOTHING;

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id)
SELECT user_id, role_id FROM users, roles WHERE users.user_type = roles.role_name;

-- Make `SuperAdmin` also an `Admin`
INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT user_id FROM users WHERE username = 'johnsmith'),
       (SELECT role_id FROM roles WHERE role_name = 'Admin')
ON CONFLICT DO NOTHING;

-- Make `Admin` also have `Employee` role
INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT user_id FROM users WHERE username = 'emmawilson'),
       (SELECT role_id FROM roles WHERE role_name = 'Employee')
ON CONFLICT DO NOTHING;

-- Bulk assign roles (testing API support)
INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT user_id FROM users WHERE username = 'alicejohnson'),
       (SELECT role_id FROM roles WHERE role_name = 'Employee')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT (SELECT user_id FROM users WHERE username = 'brianwalker'),
       (SELECT role_id FROM roles WHERE role_name = 'Client')
ON CONFLICT DO NOTHING;

-- Grant `Guest` role access to `/public/*`
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT role_id FROM roles WHERE role_name = 'Guest'),
       (SELECT permission_id FROM permissions WHERE name = 'view_public_content')
ON CONFLICT DO NOTHING;

-- Test password reset
UPDATE users SET password = 'new_hashed_password' WHERE username = 'michaelbrown';

