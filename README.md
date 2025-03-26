# Project Name - vartika-app

Backend API Server

## Prerequisites

- Node.js (v14.0.0 or higher)
- PostgreSQL (v12.0 or higher)

## Database Setup

1. Create database:

```
psql -U postgres -f backend/database/create_db.sql
```

2. Initialize database schema:

```
psql -U postgres -d your_database_name -f backend/database/schema.sql
```

## Backend Server Setup

1. Install dependencies:

```
cd backend
npm install
```

2. Configure environment variables:

Create `.env` file in the backend directory with the following:

```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=your_database_name
DB_PORT=5432
JWT_SECRET=your_jwt_secret
PORT=3000
```

3. Start the server:

```
npm start
```

Server will run at http://localhost:5001

## Testing with Postman

### Setting up Postman

1. Download and install Postman from https://www.postman.com/downloads/
2. Create a new collection named "Backend API"
3. Set up environment variables:
   - Click on "Environments" → "New"
   - Create variables:
     - `baseUrl`: http://localhost:5001
     - `token`: (leave empty initially)

### Authentication APIs

#### Register User

```
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
}
```

#### Login

```
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
```

After successful login, copy the JWT token from the response and:

1. Click on "Environment variables"
2. Set the `token` variable value
3. Save the environment

### User Management APIs

#### Get All Users

```
GET {{baseUrl}}/api/users
Authorization: Bearer {{token}}
```

#### Get User by ID

```
GET {{baseUrl}}/api/users/1
Authorization: Bearer {{token}}
```

#### Update User

```
PUT {{baseUrl}}/api/users/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "email": "newemail@example.com"
}
```

### Role Management APIs

#### Get All Roles

```
GET {{baseUrl}}/api/roles
Authorization: Bearer {{token}}
```

#### Create Role

```
POST {{baseUrl}}/api/roles
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "name": "admin",
    "description": "Administrator role"
}
```

#### Assign Role to User

```
POST {{baseUrl}}/api/users/1/roles
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "roleId": 1
}
```

### Testing Tips

1. Always check response status codes:

   - 200: Success
   - 201: Created
   - 400: Bad Request
   - 401: Unauthorized
   - 403: Forbidden
   - 404: Not Found
   - 500: Server Error

2. Test error scenarios:

   - Try logging in with wrong credentials
   - Access protected routes without token
   - Use invalid token
   - Submit invalid data formats

3. Response validation:

   - Check if response matches expected format
   - Verify all required fields are present
   - Validate data types of response fields

## Development Mode

Run in development mode (with nodemon):

```
npm start
```

## Running Tests

```
npm test
```

## Troubleshooting

If you encounter database connection issues:

1. Ensure PostgreSQL service is running
2. Verify database credentials
3. Check if database exists
4. Verify all tables are created properly
5. Make sure PostgreSQL is listening on the default port (5432)
6. Check PostgreSQL logs for any error messages

For help, please submit an issue or contact the project maintainers.
