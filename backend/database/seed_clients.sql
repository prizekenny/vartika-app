-- Seed data for clients
-- Run this after schema.sql to populate the database with test data

-- Clear existing client data (optional, comment out if you want to keep existing data)
DELETE FROM client_changes;
DELETE FROM users WHERE user_type = 'Client';

-- Insert dummy clients
INSERT INTO users (
    username, 
    email, 
    phone, 
    address, 
    client_type, 
    open_time, 
    status, 
    remark, 
    user_type
) VALUES 
-- Individual clients
(
    'John Smith', 
    'john.smith@example.com', 
    '(555) 123-4567', 
    '123 Main St, Anytown, CA 94582', 
    'Individual', 
    '9:00 AM - 5:00 PM', 
    'active', 
    'Regular customer since 2020', 
    'Client'
),
(
    'Sarah Johnson', 
    'sarah.j@example.com', 
    '(555) 234-5678', 
    '456 Oak Ave, Somewhere, NY 10001', 
    'Individual', 
    '8:30 AM - 4:30 PM', 
    'active', 
    'Prefers email communication', 
    'Client'
),
(
    'Michael Brown', 
    'mbrown@example.com', 
    '(555) 345-6789', 
    '789 Pine Rd, Nowhere, TX 75001', 
    'Individual', 
    '10:00 AM - 6:00 PM', 
    'inactive', 
    'Account on hold', 
    'Client'
),
(
    'Emily Davis', 
    'emily.davis@example.com', 
    '(555) 456-7890', 
    '321 Elm St, Anyplace, FL 33101', 
    'Individual', 
    '9:00 AM - 5:00 PM', 
    'active', 
    'New client as of Jan 2023', 
    'Client'
),
(
    'David Wilson', 
    'dwilson@example.com', 
    '(555) 567-8901', 
    '654 Maple Dr, Somewhere, WA 98001', 
    'Individual', 
    '8:00 AM - 4:00 PM', 
    'active', 
    'Requires special attention', 
    'Client'
),

-- Company clients
(
    'Acme Corporation', 
    'info@acmecorp.example.com', 
    '(555) 987-6543', 
    '1 Corporate Plaza, Business City, CA 94110', 
    'Company', 
    '8:00 AM - 6:00 PM', 
    'active', 
    'Major account - priority service', 
    'Client'
),
(
    'TechStart Inc.', 
    'contact@techstart.example.com', 
    '(555) 876-5432', 
    '200 Innovation Way, Tech Valley, CA 95123', 
    'Company', 
    '9:00 AM - 7:00 PM', 
    'active', 
    'Growing startup client', 
    'Client'
),
(
    'Global Logistics Ltd.', 
    'support@globallogistics.example.com', 
    '(555) 765-4321', 
    '300 Shipping Lane, Port City, NY 10003', 
    'Company', 
    '24/7', 
    'active', 
    'International shipping client', 
    'Client'
),
(
    'Retail Solutions Co.', 
    'info@retailsolutions.example.com', 
    '(555) 654-3210', 
    '400 Market St, Commerce Town, IL 60007', 
    'Company', 
    '8:30 AM - 5:30 PM', 
    'inactive', 
    'Account under review', 
    'Client'
),
(
    'Healthcare Partners', 
    'contact@healthcarepartners.example.com', 
    '(555) 543-2109', 
    '500 Wellness Blvd, Medical City, MA 02108', 
    'Company', 
    '7:00 AM - 8:00 PM', 
    'active', 
    'Healthcare industry client', 
    'Client'
),
(
    'Green Energy Solutions', 
    'info@greenenergy.example.com', 
    '(555) 432-1098', 
    '600 Solar Road, Eco City, CA 94107', 
    'Company', 
    '9:00 AM - 5:00 PM', 
    'active', 
    'Sustainable energy focus', 
    'Client'
),
(
    'Education First Academy', 
    'admin@educationfirst.example.com', 
    '(555) 321-0987', 
    '700 Learning Lane, Knowledge Park, TX 75074', 
    'Company', 
    '7:30 AM - 4:30 PM', 
    'active', 
    'Educational institution client', 
    'Client'
),
(
    'Gourmet Foods Inc.', 
    'sales@gourmetfoods.example.com', 
    '(555) 210-9876', 
    '800 Culinary Court, Flavor Town, CA 90210', 
    'Company', 
    '6:00 AM - 6:00 PM', 
    'active', 
    'Food industry client', 
    'Client'
),
(
    'Construction Experts LLC', 
    'projects@constructionexperts.example.com', 
    '(555) 109-8765', 
    '900 Builder Blvd, Foundation City, TX 77002', 
    'Company', 
    '7:00 AM - 4:00 PM', 
    'active', 
    'Construction industry client', 
    'Client'
),
(
    'Financial Advisors Group', 
    'advisors@financialgroup.example.com', 
    '(555) 098-7654', 
    '1000 Money Lane, Wealth City, NY 10005', 
    'Company', 
    '9:00 AM - 5:00 PM', 
    'active', 
    'Financial services client', 
    'Client'
);

-- Output confirmation message
SELECT 'Inserted ' || COUNT(*) || ' client records.' AS result FROM users WHERE user_type = 'Client'; 