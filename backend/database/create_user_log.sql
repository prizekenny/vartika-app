CREATE TABLE user_logs (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255),
    action VARCHAR(255),
    target VARCHAR(255),
    detail JSONB,
    ip_address VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);