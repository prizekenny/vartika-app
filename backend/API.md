# 📡 API Endpoints

## 🛠 **Authentication Endpoints**

| Method   | Endpoint                   | Function                         |
| -------- | -------------------------- | -------------------------------- |
| **POST** | `/api/auth/register`       | Register user (local)            |
| **POST** | `/api/auth/login`          | Login user (local)               |
| **GET**  | `/auth/google`             | Redirect user to Google OAuth    |
| **GET**  | `/auth/google/callback`    | Handle Google OAuth login        |
| **GET**  | `/auth/microsoft`          | Redirect user to Microsoft OAuth |
| **GET**  | `/auth/microsoft/callback` | Handle Microsoft OAuth           |
| **GET**  | `/auth/facebook`           | Redirect user to Facebook OAuth  |
| **GET**  | `/auth/facebook/callback`  | Handle Facebook OAuth            |
| **GET**  | `/auth/logout`             | Logout user                      |

---

## 📬 **Gmail API Endpoints**

| Method  | Endpoint                               | Function                                                 |
| ------- | -------------------------------------- | -------------------------------------------------------- |
| **GET** | `/auth/gmail`                          | Redirect user to Google OAuth for Gmail access           |
| **GET** | `/auth/gmail/callback`                 | Handle Gmail OAuth and store refresh token               |
| **GET** | `/api/gmail/unread/:email`             | Get all unread Gmail messages (IDs only)                 |
| **GET** | `/api/gmail/all/:email`                | Get all Gmail messages (IDs only, paginated)             |
| **GET** | `/api/gmail/message/:email/:messageId` | Get detailed Gmail message (subject, sender, body, etc.) |

---

## 👤 **User Management API**

| Method     | Endpoint             | Function                       |
| ---------- | -------------------- | ------------------------------ |
| **GET**    | `/api/users/current` | Get current authenticated user |
| **GET**    | `/api/users/:userId` | Get user details by ID         |
| **PUT**    | `/api/users/:userId` | Update user details            |
| **DELETE** | `/api/users/:userId` | Delete user account            |

---

## 🚀 **Usage**

- 🔹 **Google Authentication:** `/auth/google` → Redirects user to sign in with Google.
- 🔹 **Gmail API:** Requires **Gmail OAuth** via `/auth/gmail` before accessing email endpoints.
- 🔹 **User API:** Manage users via `/api/users`.

🚀 **Now you can use this structured API documentation for your project!** ✅
