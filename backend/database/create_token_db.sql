
DROP TABLE api_tokens;
CREATE TABLE api_tokens (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,  -- User's email (can repeat for different platforms)
    platform VARCHAR(50) NOT NULL,     -- e.g., "gmail", "google_drive", "quickbooks"
    access_token TEXT,                 --  Nullable: May expire
    refresh_token TEXT NOT NULL,        -- Always required for renewal
    realm_id VARCHAR(50),  -- 🆕 QuickBooks Realm ID (only used for QuickBooks)
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- When access_token expires
    last_refreshed TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Last refresh timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_platform UNIQUE (user_email, platform) --  Ensures one token per platform
);