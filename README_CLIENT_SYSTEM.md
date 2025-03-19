# Client Management System Setup Guide

This guide will help you set up and test the real-time client management system.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Git

## Setup Steps

### 1. Database Setup

First, make sure your PostgreSQL database is running and accessible. Then, configure your database connection in the `.env` file:

```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vartika_app
```

### 2. Run Database Schema and Seed Script

To create the database schema and populate it with dummy client data:

```bash
cd backend
npm run setup-db
```

This will:
- Create the necessary tables (users, client_changes, etc.)
- Insert 15 dummy client records (5 individuals and 10 companies)

### 3. Start the Backend Server

```bash
cd backend
npm install
npm start
```

The server will start on port 5001 by default, and the WebSocket server will be available at `ws://localhost:5001`.

### 4. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```

The frontend application will start and be available at `http://localhost:3000` (or another port if configured differently).

## Testing the Client Management System

1. **View Clients**: Navigate to the Clients tab in the workspace. You should see the list of dummy clients loaded from the database.

2. **Search Clients**: Use the search bar to filter clients by name or email.

3. **Add a New Client**: 
   - Click the "Add New Client" button
   - Fill in the client details
   - Click "OK" to save
   - The new client should appear in the list immediately

4. **Edit a Client**:
   - Click the "Edit" button on any client row
   - Modify the client details
   - Click "OK" to save
   - The changes should be reflected immediately

5. **Delete a Client**:
   - Click the "Delete" button on any client row
   - Confirm the deletion
   - The client should be removed from the list immediately

## Real-time Synchronization Testing

To test the real-time synchronization:

1. Open the application in two different browser windows or tabs
2. Make changes in one window (add, edit, or delete a client)
3. Observe that the changes are automatically reflected in the other window without refreshing

## Troubleshooting

### Connection Issues

If you see "Disconnected" status:
- Check that the backend server is running
- Verify the WebSocket connection URL in the frontend code (should be `ws://localhost:5001`)
- Click the "Reconnect" button to attempt to reestablish the connection

### Database Issues

If clients aren't loading:
- Check the database connection settings in `.env`
- Verify that the database schema was created correctly
- Check the backend console for any error messages

## Additional Information

- The client data is stored in the `users` table with `user_type = 'Client'`
- Changes to client data are tracked in the `client_changes` table
- The WebSocket connection handles real-time updates between the frontend and backend 