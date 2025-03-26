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
| **GET** | `/api/gmail/authorized/:email`         | Check if Gmail API is authorized for a specific email    |
| **GET** | `/api/gmail/authorized-users`          | Get all users which is authorized.                       |

---

## ☁️ **Google Drive API Endpoints**

| Method   | Endpoint                      | Function                                |
| -------- | ----------------------------- | --------------------------------------- |
| **GET**  | `/auth/drive`                 | Redirect user to Google OAuth for Drive |
| **GET**  | `/auth/drive/callback`        | Handle Google Drive OAuth               |
| **POST** | `/api/drive/upload`           | Upload file to Google Drive             |
| **GET**  | `/api/drive/authorized`       | Check if Google Drive API is authorized |
| **GET**  | `/api/drive/authorized-users` | Get all users which is authorized.      |

---

## 📊 **QuickBooks API Endpoints**

| Method  | Endpoint                                         | Function                              |
| ------- | ------------------------------------------------ | ------------------------------------- |
| **GET** | `/api/quickbooks/company`                        | Fetch QuickBooks company info         |
| **GET** | `/api/quickbooks/invoices`                       | Fetch all QuickBooks invoices         |
| **GET** | `/api/quickbooks/reports/profit-and-loss`        | Fetch Profit and Loss report          |
| **GET** | `/api/quickbooks/reports/profit-and-loss-detail` | Fetch Profit and Loss Detail report   |
| **GET** | `/api/quickbooks/authorized`                     | Check if QuickBooks API is authorized |
| **GET** | `/api/quickbooks/authorized-users`               | Get all users which is authorized.    |

---

## 👤 **User Management API**

| Method     | Endpoint             | Function                       |
| ---------- | -------------------- | ------------------------------ |
| **GET**    | `/api/users/current` | Get current authenticated user |
| **GET**    | `/api/users/:userId` | Get user details by ID         |
| **PUT**    | `/api/users/:userId` | Update user details            |
| **DELETE** | `/api/users/:userId` | Delete user account            |

---

## 🚀 **Usage Notes**

- 🔹 **Google Authentication:** `/auth/google` → Redirects user to sign in with Google.
- 🔹 **Gmail API:** Requires **Gmail OAuth** via `/auth/gmail` before accessing email endpoints.
- 🔹 **Google Drive API:** Requires **Google Drive OAuth** via `/auth/drive` before accessing file operations.
- 🔹 **QuickBooks API:** Requires **QuickBooks OAuth** before accessing financial reports and invoices.
- 🔹 **User API:** Manage users via `/api/users`.

🚀 **Now your API documentation is up-to-date with the new QuickBooks endpoints!** ✅
