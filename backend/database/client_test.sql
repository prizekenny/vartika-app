-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert test users first (these will be clients)
INSERT INTO users (username, email, password, phone, status, user_type) VALUES 
('johncorp', 'john.corp@example.com', 'hashed_password', '+1 (416) 555-1234', 'active', 'Client'),
('alicesmith', 'alice.smith@example.com', 'hashed_password', '+1 (647) 555-5678', 'active', 'Client'),
('techsolutions', 'info@techsolutions.com', 'hashed_password', '+1 (905) 555-9012', 'active', 'Client'),
('robertjones', 'robert.jones@example.com', 'hashed_password', '+1 (289) 555-3456', 'inactive', 'Client'),
('globalinc', 'contact@globalinc.com', 'hashed_password', '+1 (416) 555-7890', 'active', 'Client')
ON CONFLICT (email) DO NOTHING;

-- Assign Client role to all clients
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id 
FROM users u, roles r 
WHERE u.email IN (
    'john.corp@example.com',
    'alice.smith@example.com',
    'info@techsolutions.com',
    'robert.jones@example.com',
    'contact@globalinc.com'
) AND r.role_name = 'Client'
ON CONFLICT DO NOTHING;

-- Insert client details
INSERT INTO clients (user_id, client_type)
SELECT u.user_id,
       CASE WHEN u.username IN ('johncorp', 'techsolutions', 'globalinc') THEN 'Company' 
            ELSE 'Individual' END
FROM users u
WHERE u.email IN (
    'john.corp@example.com',
    'alice.smith@example.com',
    'info@techsolutions.com',
    'robert.jones@example.com',
    'contact@globalinc.com'
);

-- Add more test client users
INSERT INTO users (username, email, password, phone, status, user_type) VALUES 
('sarahlee', 'sarah.lee@example.com', 'hashed_password', '+1 (647) 555-2468', 'active', 'Client'),
('innovatech', 'support@innovatech.com', 'hashed_password', '+1 (416) 555-1357', 'active', 'Client'),
('michaelwong', 'michael.wong@example.com', 'hashed_password', '+1 (905) 555-8642', 'inactive', 'Client'),
('premiumservices', 'info@premiumservices.com', 'hashed_password', '+1 (289) 555-9753', 'active', 'Client'),
('jenniferpark', 'jennifer.park@example.com', 'hashed_password', '+1 (416) 555-3579', 'active', 'Client')
ON CONFLICT (email) DO NOTHING;

-- Assign Client role to additional clients
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id 
FROM users u, roles r 
WHERE u.email IN (
    'sarah.lee@example.com',
    'support@innovatech.com',
    'michael.wong@example.com',
    'info@premiumservices.com',
    'jennifer.park@example.com'
) AND r.role_name = 'Client'
ON CONFLICT DO NOTHING;

-- Add corresponding client details for additional clients
INSERT INTO clients (user_id, company_name, contact_person, contact_email, contact_phone, address, client_type)
SELECT u.user_id, 
       CASE WHEN u.username = 'innovatech' THEN 'Innovatech Solutions' 
            WHEN u.username = 'premiumservices' THEN 'Premium Services Co.' 
            ELSE NULL END,
       CASE WHEN u.username = 'sarahlee' THEN 'Sarah Lee' 
            WHEN u.username = 'innovatech' THEN 'Innovation Team' 
            WHEN u.username = 'michaelwong' THEN 'Michael Wong' 
            WHEN u.username = 'premiumservices' THEN 'Premium Support' 
            WHEN u.username = 'jenniferpark' THEN 'Jennifer Park' END,
       u.email,
       u.phone,
       CASE WHEN u.username = 'sarahlee' THEN '202 Pine St, Toronto, ON' 
            WHEN u.username = 'innovatech' THEN '303 Innovation Dr, Vaughan, ON' 
            WHEN u.username = 'michaelwong' THEN '404 Maple Ave, Richmond Hill, ON' 
            WHEN u.username = 'premiumservices' THEN '505 Premium Blvd, Toronto, ON' 
            WHEN u.username = 'jenniferpark' THEN '606 Cherry St, Toronto, ON' END,
       CASE WHEN u.username IN ('innovatech', 'premiumservices') THEN 'Company' 
            ELSE 'Individual' END
FROM users u
WHERE u.email IN (
    'sarah.lee@example.com',
    'support@innovatech.com',
    'michael.wong@example.com',
    'info@premiumservices.com',
    'jennifer.park@example.com'
); 