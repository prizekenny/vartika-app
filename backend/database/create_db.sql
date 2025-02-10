-- Check if database exists and create if it doesn't
SELECT 'CREATE DATABASE vartika_portal_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'vartika_portal_db')\gexec 