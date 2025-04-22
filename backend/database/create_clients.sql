DELETE FROM users WHERE email IN (
  'sophia.lee@gmail.com',
  'liam.james@outlook.com',
  'olivia.williams@yahoo.com',
  'noah.brown@hotmail.com',
  'emma.johnson@gmail.com',
  'jack.thomas@icloud.com',
  'ava.martin@outlook.com',
  'lucas.davis@gmail.com',
  'mia.miller@yahoo.com',
  'elijah.moore@protonmail.com',
  'isabella.taylor@gmail.com',
  'ethan.anderson@live.com',
  'amelia.thomas@gmail.com',
  'mason.jackson@outlook.com',
  'harper.white@yahoo.com',
  'logan.harris@gmail.com',
  'evelyn.clark@hotmail.com',
  'aiden.rodriguez@gmail.com',
  'lily.lewis@outlook.com',
  'james.walker@gmail.com'
);

-- Assuming users table already exists

INSERT INTO users (user_id, email) VALUES
('b5cbd8fc-d2f4-4f09-bc51-9472f26b5a0e', 'sophia.lee@gmail.com'),
('a2f0f35d-cd3d-4c10-9c94-2a4fdc9fa591', 'liam.james@outlook.com'),
('c1d922b3-5d6d-4ea3-9eb0-6a5d88f84baf', 'olivia.williams@yahoo.com'),
('e13cb8be-3481-4a3b-9c0b-387b1f99f6c3', 'noah.brown@hotmail.com'),
('f8b24336-9338-4c36-a8d7-fdbe15249fc2', 'emma.johnson@gmail.com'),
('a0c61646-0a10-49ac-9fd4-1d9938c9a236', 'jack.thomas@icloud.com'),
('b4573e7f-feb3-486c-a394-712b6c69cf4e', 'ava.martin@outlook.com'),
('9db4e61d-84a5-4d68-9d03-f3e5a1c80ea2', 'lucas.davis@gmail.com'),
('e25949bb-b4c2-4f60-854c-03e8a15e2cf8', 'mia.miller@yahoo.com'),
('fd804aad-3e88-4e30-8613-b21ed6db1a63', 'elijah.moore@protonmail.com'),
('f18d0c0e-f7f0-441e-9912-2d44986a3b79', 'isabella.taylor@gmail.com'),
('75eb0984-0ff7-41a8-a8cb-84a098fa1bce', 'ethan.anderson@live.com'),
('30750e4c-835b-442e-a536-7695de7e35eb', 'amelia.thomas@gmail.com'),
('1cf42f7d-4874-4fd6-b221-2f7ad7163653', 'mason.jackson@outlook.com'),
('76f685b2-1d89-46fa-925e-888a1ff0423c', 'harper.white@yahoo.com'),
('03cf1586-29d4-48aa-9db8-9f7b3dc2608b', 'logan.harris@gmail.com'),
('b499528b-7f4b-421d-a78b-6619e8e91c06', 'evelyn.clark@hotmail.com'),
('d9e9359c-b48e-4c6a-9ed9-2b5dcad34237', 'aiden.rodriguez@gmail.com'),
('fcd11fc8-0584-4f06-86a3-89363b4feae2', 'lily.lewis@outlook.com'),
('ef00a003-7ee6-4e9f-b0a0-2a08f3d02e2a', 'james.walker@gmail.com');

DROP TABLE IF EXISTS clients CASCADE;

CREATE TABLE clients (
    client_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Unique identifier for the client
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Reference to the user who owns the client
    type VARCHAR(20) CHECK (type IN ('Individual', 'Company')) NOT NULL, -- Type of client: Individual or Company
    client_name VARCHAR(255), -- Name of the company (if applicable)
    contact_email VARCHAR(100), -- Contact email address for the client
    phone VARCHAR(20), -- Contact phone number for the client
    address TEXT, -- Full address of the client
    contact_name VARCHAR(100), -- Name of the main contact person
    position VARCHAR(100), -- Position/title of the contact person
    tax_id VARCHAR(50), -- Tax identification number of the client
    currency VARCHAR(10), -- Preferred currency for transactions
    payment_terms VARCHAR(100), -- Payment terms agreed with the client
    country VARCHAR(100), -- Country of the client
    province_state VARCHAR(100), -- Province or state of the client
    city VARCHAR(100), -- City of the client
    postal_code VARCHAR(20), -- Postal code of the client
    qb_display_name VARCHAR(255), -- Display name in QuickBooks
    qb_last_synced_at TIMESTAMP, -- Last time client was synced with QuickBooks
    qb_customer_id VARCHAR(50),  -- QuickBooks Customer ID
    status VARCHAR(20) DEFAULT 'active', -- Status of the client (e.g., active, inactive)
    remark TEXT, -- Additional remarks or notes about the client
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the client was created
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Timestamp when the client was last updated
);

-- Dummy clients
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'b5cbd8fc-d2f4-4f09-bc51-9472f26b5a0e', 'Company', 'Example Co. Ltd', 'contact@example.com', '123-456-7890',
  '123 Example St, Example City', 'John Doe', 'Manager', 'TX1234567', 'USD', 'Net 30',
  'Canada', 'Alberta', 'Calgary', 'T2N 1N4', 'Example Co. Ltd', NOW(), 'QB123', 'active', 'Test client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'a2f0f35d-cd3d-4c10-9c94-2a4fdc9fa591', 'Company', 'Acme Corp', 'info@acme.com', '555-111-2222',
  '456 Acme Ave, Acmetown', 'Alice Smith', 'Director', 'AC9876543', 'CAD', 'Net 15',
  'Canada', 'Ontario', 'Toronto', 'M5V 2T6', 'Acme Corp', NOW(), 'QB124', 'active', 'Preferred client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'c1d922b3-5d6d-4ea3-9eb0-6a5d88f84baf', 'Company', 'Beta Solutions', 'beta@solutions.com', '555-222-3333',
  '789 Beta Road, Betaville', 'Bob Brown', 'CEO', 'BS6543210', 'USD', 'Net 45',
  'USA', 'California', 'Los Angeles', '90001', 'Beta Solutions', NOW(), 'QB125', 'active', 'International client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'e13cb8be-3481-4a3b-9c0b-387b1f99f6c3', 'Company', 'Gamma Industries', 'contact@gamma.com', '555-333-4444',
  '321 Gamma Blvd, Gammatown', 'Carol White', 'CFO', 'GI3210987', 'EUR', 'Net 30',
  'Germany', 'Bavaria', 'Munich', '80331', 'Gamma Industries', NOW(), 'QB126', 'active', 'European client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'f8b24336-9338-4c36-a8d7-fdbe15249fc2', 'Company', 'Delta Ventures', 'delta@ventures.com', '555-444-5555',
  '654 Delta St, Deltacity', 'David Black', 'CTO', 'DV4567890', 'GBP', 'Net 60',
  'UK', 'England', 'London', 'SW1A 1AA', 'Delta Ventures', NOW(), 'QB127', 'active', 'UK partner'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'a0c61646-0a10-49ac-9fd4-1d9938c9a236', 'Company', 'Epsilon LLC', 'info@epsilon.com', '555-555-6666',
  '987 Epsilon Lane, Epsilonia', 'Eve Green', 'COO', 'ELLC123456', 'USD', 'Net 30',
  'USA', 'Texas', 'Houston', '77001', 'Epsilon LLC', NOW(), 'QB128', 'active', 'US client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'b4573e7f-feb3-486c-a394-712b6c69cf4e', 'Company', 'Zeta Group', 'zeta@group.com', '555-666-7777',
  '432 Zeta Avenue, Zetaville', 'Frank Blue', 'VP', 'ZG7894561', 'CAD', 'Net 15',
  'Canada', 'British Columbia', 'Vancouver', 'V6B 1A1', 'Zeta Group', NOW(), 'QB129', 'active', 'West coast client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  '9db4e61d-84a5-4d68-9d03-f3e5a1c80ea2', 'Company', 'Theta Partners', 'theta@partners.com', '555-777-8888',
  '876 Theta Rd, Thetacity', 'Grace Violet', 'Partner', 'TP6547893', 'USD', 'Net 30',
  'USA', 'New York', 'New York', '10001', 'Theta Partners', NOW(), 'QB130', 'active', 'NYC client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'e25949bb-b4c2-4f60-854c-03e8a15e2cf8', 'Company', 'Iota Inc', 'contact@iota.com', '555-888-9999',
  '159 Iota Dr, Iotaville', 'Henry Indigo', 'President', 'II9876542', 'USD', 'Net 30',
  'USA', 'Illinois', 'Chicago', '60601', 'Iota Inc', NOW(), 'QB131', 'active', 'Midwest client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'fd804aad-3e88-4e30-8613-b21ed6db1a63', 'Company', 'Kappa Enterprises', 'kappa@enterprises.com', '555-999-0000',
  '753 Kappa Blvd, Kappatown', 'Ivy Orange', 'Owner', 'KE3216547', 'CAD', 'Net 45',
  'Canada', 'Quebec', 'Montreal', 'H3A 2B5', 'Kappa Enterprises', NOW(), 'QB132', 'active', 'French-speaking client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  '75eb0984-0ff7-41a8-a8cb-84a098fa1bce', 'Company', 'Lambda Technologies', 'lambda@tech.com', '555-101-2020',
  '246 Lambda St, Lambdacity', 'Jack Red', 'Lead Engineer', 'LT5678901', 'USD', 'Net 30',
  'USA', 'Washington', 'Seattle', '98101', 'Lambda Technologies', NOW(), 'QB133', 'active', 'Tech client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  '1cf42f7d-4874-4fd6-b221-2f7ad7163653', 'Company', 'Mu Dynamics', 'mu@dynamics.com', '555-202-3030',
  '135 Mu Lane, Mutown', 'Karen Silver', 'Analyst', 'MD8901234', 'USD', 'Net 60',
  'USA', 'Florida', 'Miami', '33101', 'Mu Dynamics', NOW(), 'QB134', 'active', 'Florida client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  '76f685b2-1d89-46fa-925e-888a1ff0423c', 'Company', 'Nu Systems', 'nu@systems.com', '555-303-4040',
  '864 Nu St, Nusville', 'Leo Gold', 'SysAdmin', 'NS4561237', 'EUR', 'Net 30',
  'France', 'Ile-de-France', 'Paris', '75001', 'Nu Systems', NOW(), 'QB135', 'active', 'European client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  '03cf1586-29d4-48aa-9db8-9f7b3dc2608b', 'Company', 'Omicron Services', 'omicron@services.com', '555-404-5050',
  '975 Omicron Ave, Omicroncity', 'Mona Pink', 'Service Lead', 'OS6543218', 'USD', 'Net 30',
  'USA', 'Georgia', 'Atlanta', '30301', 'Omicron Services', NOW(), 'QB136', 'active', 'Southern client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'b499528b-7f4b-421d-a78b-6619e8e91c06', 'Company', 'Pi Consulting', 'pi@consulting.com', '555-505-6060',
  '468 Pi Rd, Picity', 'Nina Brown', 'Consultant', 'PC7891234', 'CAD', 'Net 15',
  'Canada', 'Manitoba', 'Winnipeg', 'R3C 4T3', 'Pi Consulting', NOW(), 'QB137', 'active', 'Consulting client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'd9e9359c-b48e-4c6a-9ed9-2b5dcad34237', 'Company', 'Rho Logistics', 'rho@logistics.com', '555-606-7070',
  '357 Rho Blvd, Rhotown', 'Oscar Gray', 'Logistics Head', 'RL3219876', 'USD', 'Net 30',
  'USA', 'Ohio', 'Columbus', '43215', 'Rho Logistics', NOW(), 'QB138', 'active', 'Logistics partner'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'fcd11fc8-0584-4f06-86a3-89363b4feae2', 'Company', 'Sigma Ventures', 'sigma@ventures.com', '555-707-8080',
  '753 Sigma St, Sigmatown', 'Paul White', 'Investor', 'SV6547891', 'USD', 'Net 30',
  'USA', 'Colorado', 'Denver', '80202', 'Sigma Ventures', NOW(), 'QB139', 'active', 'Investment client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  '30750e4c-835b-442e-a536-7695de7e35eb', 'Company', 'Tau Consulting', 'tau@consulting.com', '555-808-9090',
  '159 Tau Ave, Tautown', 'Quinn Black', 'Consultant', 'TC9871234', 'CAD', 'Net 30',
  'Canada', 'Nova Scotia', 'Halifax', 'B3J 2K9', 'Tau Consulting', NOW(), 'QB140', 'active', 'Eastern Canada client'
);
INSERT INTO clients (
  user_id, type, company_name, contact_email, phone, address, contact_name,
  position, tax_id, currency, payment_terms, country, province_state, city,
  postal_code, qb_display_name, qb_last_synced_at, qb_customer_id, status, remark
) VALUES (
  'ef00a003-7ee6-4e9f-b0a0-2a08f3d02e2a', 'Company', 'Upsilon Group', 'upsilon@group.com', '555-909-1010',
  '951 Upsilon Rd, Upsiloncity', 'Rachel Blue', 'Group Lead', 'UG1237894', 'USD', 'Net 60',
  'USA', 'Arizona', 'Phoenix', '85001', 'Upsilon Group', NOW(), 'QB141', 'active', 'Southwest client'
);