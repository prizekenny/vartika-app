psql -U postgres -f backend/database/create_db.sql
psql -U postgres -d vartika_portal_db -f backend/database/create_token_db.sql
psql -U postgres -d vartika_portal_db -f backend/database/schema.sql
psql -U postgres -d vartika_portal_db -f backend/database/client_test.sql
