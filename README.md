<div align="center">

<img src="https://img.shields.io/badge/FinanceOS-Dashboard-6366f1?style=for-the-badge&logo=lightning&logoColor=white" alt="FinanceOS" />

<h1>💹 FinanceOS</h1>
<p><strong>A production-grade, full-stack Finance Dashboard with real-time WebSocket updates, role-based access control, and audit logging.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat-square&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white" />
</p>

<p>
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-api-reference">API</a> ·
  <a href="#-demo-accounts">Demo Accounts</a>
</p>

</div>

---

## ✨ Features

<details open>
<summary><strong>🔐 Role-Based Access Control (RBAC)</strong></summary>
<br/>

Three distinct roles with enforced permissions at every layer — database, middleware, and UI:

| Role | Dashboard | Records | Analytics | Users | Access Requests | Audit Logs |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Admin** | ✅ Full | ✅ Full | ✅ Full | ✅ Manage | ✅ Approve/Reject | ✅ View |
| **Analyst** | ✅ Full | ✅ Full | ✅ Full | ❌ | ❌ | ❌ |
| **Viewer** | ✅ Summary | 👁 View Only | ❌ | ❌ | ❌ | ❌ |

</details>

<details>
<summary><strong>⚡ Real-Time WebSocket Events</strong></summary>
<br/>

Built with **Socket.IO**. No page reloads — events are pushed instantly over a persistent connection.

| Event | Triggered By | Received By | Effect |
|:---|:---|:---|:---|
| `access_request:new` | User submits upgrade request | All Admins | Access Requests page auto-refreshes + toast |
| `role:updated` | Admin approves a request | The affected user only | Success toast → auto logout → redirect to login with new role JWT |
| `access_request:rejected` | Admin rejects a request | The affected user only | Error toast notification |

All WebSocket connections are **JWT-authenticated on the handshake**. Connections are rejected if the token is absent or invalid.

</details>

<details>
<summary><strong>📊 Financial Records & Analytics</strong></summary>
<br/>

- Full **CRUD** with soft-delete (trash / restore flow)
- Advanced filtering by **type**, **category**, **date range**, and free-text search
- **MongoDB Aggregation Pipelines** compute dashboard KPIs, monthly trends, and category breakdowns in a single database round-trip
- **Recharts** renders Monthly Income vs Expense bar chart, Category pie chart, Net Balance line chart

</details>

<details>
<summary><strong>🛡 Security</strong></summary>
<br/>

- **JWT** authentication with `Authorization: Bearer` header
- **bcryptjs** password hashing (cost factor 12)
- **Helmet** security headers on all responses
- **express-rate-limit** — 100 requests / 15 min per IP on all `/api/` routes
- Role-checked on every protected backend route via `authenticate` + `authorize` middleware

</details>

<details>
<summary><strong>📋 Audit Logging</strong></summary>
<br/>

Every critical action is silently logged to MongoDB via a fire-and-forget `logAction()` service:

| Action Code | Trigger |
|:---|:---|
| `AUTH_LOGIN` | Successful user login |
| `AUTH_REGISTER` | New user registration |
| `RECORD_CREATED` | Financial record added |
| `RECORD_UPDATED` | Financial record edited |
| `RECORD_DELETED` | Financial record soft-deleted |
| `RECORD_RESTORED` | Financial record restored from trash |
| `USER_UPDATED` | Admin changes a user's role or status |
| `USER_DEACTIVATED` | Admin deactivates a user |
| `ACCESS_REQUEST_CREATED` | User submits role upgrade request |
| `ACCESS_REQUEST_APPROVED` | Admin approves role upgrade |
| `ACCESS_REQUEST_REJECTED` | Admin rejects role upgrade |

</details>

<details>
<summary><strong>📄 Swagger API Docs</strong></summary>
<br/>

Interactive OpenAPI 3.0 documentation is available at:

```
http://localhost:5000/api/docs
```

</details>

---

## 🛠 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Backend
| Technology | Purpose |
|:---|:---|
| **Node.js 18+** | Runtime |
| **Express 4** | HTTP framework |
| **MongoDB + Mongoose** | Database & ODM |
| **Socket.IO 4** | WebSocket server |
| **jsonwebtoken** | JWT auth |
| **bcryptjs** | Password hashing |
| **Joi + express-validator** | Request validation |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |
| **Morgan** | HTTP logging |
| **Swagger / OpenAPI 3** | API documentation |

</td>
<td valign="top" width="50%">

### Frontend
| Technology | Purpose |
|:---|:---|
| **React 19 + TypeScript** | UI library |
| **Vite 8** | Build tool & dev server |
| **React Router 7** | Client-side routing |
| **Socket.IO Client 4** | WebSocket client |
| **Axios** | HTTP client & interceptors |
| **Recharts** | Data visualization |
| **Lucide React** | Icon library |
| **react-hot-toast** | Toast notifications |
| **date-fns** | Date formatting |
| **Vanilla CSS** | Custom design system |

</td>
</tr>
</table>

---

## 🏛 Architecture

<details>
<summary><strong>Project Structure</strong></summary>

```
Zorvyn/
├── backend/
│   ├── server.js                   # Entry point — http server + Socket.IO init
│   └── src/
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── record.controller.js
│       │   ├── dashboard.controller.js
│       │   ├── accessRequest.controller.js
│       │   └── auditLog.controller.js
│       ├── middleware/
│       │   ├── authenticate.js         # JWT verification
│       │   ├── authorize.js            # Role-based route guard
│       │   ├── errorHandler.js         # Centralized error handler
│       │   └── rateLimiter.js
│       ├── models/
│       │   ├── User.js
│       │   ├── FinancialRecord.js
│       │   ├── AccessRequest.js
│       │   └── AuditLog.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── record.routes.js
│       │   ├── dashboard.routes.js
│       │   ├── accessRequest.routes.js
│       │   └── audit.routes.js
│       ├── services/
│       │   ├── audit.service.js        # Fire-and-forget audit logging
│       │   └── websocket.service.js    # Socket.IO singleton + room management
│       └── utils/
│           ├── seed.js
│           └── swagger.js
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.tsx          # Auth state + WebSocket lifecycle
        ├── services/
        │   ├── api.ts                   # Axios instance + interceptors
        │   └── socket.ts               # Socket.IO client singleton
        ├── hooks/
        │   ├── useSocket.ts            # Socket access hook
        │   └── useDebounce.ts
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.tsx         # Role-aware navigation
        │   │   └── ProtectedRoute.tsx
        │   ├── charts/
        │   │   └── DashboardCharts.tsx
        │   └── ui/
        │       ├── RequestAccessModal.tsx
        │       ├── UserModal.tsx
        │       └── ConfirmModal.tsx
        └── pages/
            ├── LandingPage.tsx
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            ├── DashboardPage.tsx
            ├── RecordsPage.tsx
            ├── AnalyticsPage.tsx
            ├── UsersPage.tsx
            ├── AccessRequestsPage.tsx
            └── AuditLogsPage.tsx
```

</details>

<details>
<summary><strong>RBAC — Three-Layer Enforcement</strong></summary>
<br/>

```
Request
  │
  ├─ 1. Middleware Layer (Backend — authoritative)
  │      authenticate.js  →  verifies JWT, attaches req.user
  │      authorize.js     →  checks req.user.role against allowed roles
  │      (Rejects with 401/403 if either check fails)
  │
  ├─ 2. Business Logic Layer
  │      Controllers enforce ownership (createdBy) for record-level access
  │
  └─ 3. UI Layer (Frontend — display only)
         ProtectedRoute    → redirects unauthenticated users
         RoleGate          → hides/shows components by role
         Sidebar           → renders nav items conditionally by role
```

</details>

<details>
<summary><strong>WebSocket — Room-Based Event Routing</strong></summary>
<br/>

```
On connect: JWT verified on handshake
  → socket joins  user:<userId>    (private room)
  → if Admin: also joins  admins   (broadcast room)

accessRequest.controller.js emits after each DB write:
  createRequest   →  emitToAdmins('access_request:new', { request })
  approveRequest  →  emitToUser(userId, 'role:updated', { newRole })
  rejectRequest   →  emitToUser(userId, 'access_request:rejected', { message })

Frontend AuthContext listens globally:
  role:updated              → toast → auto logout → redirect /login
  access_request:rejected   → error toast

AccessRequestsPage listens:
  access_request:new        → re-fetch list + info toast
```

</details>

<details>
<summary><strong>Soft Delete Pattern</strong></summary>
<br/>

Financial records are never hard-deleted. Instead:

1. `DELETE /api/records/:id` sets `isDeleted: true` on the document.
2. All normal queries include `{ isDeleted: false }` in the filter.
3. `GET /api/records/trash` returns soft-deleted records for review.
4. `PATCH /api/records/:id/restore` sets `isDeleted: false` to recover a record.

This preserves full auditability and prevents accidental data loss.

</details>

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB** — Atlas cluster or local instance

### 1. Clone & Install

```bash
# Clone the repo
git clone https://github.com/Tejaskar2006/Finance-Data-Processing.git
cd Finance-Data-Processing

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

Create `backend/.env` (copy from `backend/.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/financeos
JWT_SECRET=your_super_secret_key_min_32_chars
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### 3. Seed Demo Data

```bash
cd backend
npm run seed
```

### 4. Run the App

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open → **http://localhost:5173**

---

## 🔑 Demo Accounts

> Run `npm run seed` in `/backend` first to create these accounts.

| Role | Email | Password | Access Level |
|:---|:---|:---|:---|
| **Admin** | `admin@finance.com` | `Admin123!` | Full access — all pages, user management, audit logs |
| **Analyst** | `analyst@finance.com` | `Analyst123!` | Dashboard, Records, Analytics — no user management |
| **Viewer** | `viewer@finance.com` | `Viewer123!` | Dashboard summary + read-only records |

---

## 🔌 API Reference

<details>
<summary><strong>Auth</strong></summary>

| Method | Endpoint | Auth | Description |
|:---|:---|:---:|:---|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |

</details>

<details>
<summary><strong>Financial Records</strong></summary>

| Method | Endpoint | Auth | Role | Description |
|:---|:---|:---:|:---:|:---|
| `GET` | `/api/records` | ✅ | All | List records (paginated, filterable) |
| `POST` | `/api/records` | ✅ | Admin, Analyst | Create a record |
| `PATCH` | `/api/records/:id` | ✅ | Admin, Analyst | Update a record |
| `DELETE` | `/api/records/:id` | ✅ | Admin, Analyst | Soft-delete a record |
| `GET` | `/api/records/trash` | ✅ | Admin | List deleted records |
| `PATCH` | `/api/records/:id/restore` | ✅ | Admin | Restore a deleted record |

</details>

<details>
<summary><strong>Users (Admin only)</strong></summary>

| Method | Endpoint | Auth | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/users` | ✅ | List all users (paginated, filterable) |
| `GET` | `/api/users/:id` | ✅ | Get a user by ID |
| `POST` | `/api/users` | ✅ | Create a user |
| `PATCH` | `/api/users/:id` | ✅ | Update name, role, or status |
| `DELETE` | `/api/users/:id` | ✅ | Deactivate a user |

</details>

<details>
<summary><strong>Role Upgrade Requests</strong></summary>

| Method | Endpoint | Auth | Role | Description |
|:---|:---|:---:|:---:|:---|
| `POST` | `/api/access-request` | ✅ | All | Submit a role upgrade request |
| `GET` | `/api/access-request` | ✅ | Admin | List all requests |
| `PATCH` | `/api/access-request/:id/approve` | ✅ | Admin | Approve a request |
| `PATCH` | `/api/access-request/:id/reject` | ✅ | Admin | Reject a request |

</details>

<details>
<summary><strong>Dashboard & Audit Logs</strong></summary>

| Method | Endpoint | Auth | Role | Description |
|:---|:---|:---:|:---:|:---|
| `GET` | `/api/dashboard` | ✅ | All | Aggregated KPIs, trends, breakdowns |
| `GET` | `/api/audit-logs` | ✅ | Admin | Paginated audit log with filters |

</details>

> 📖 Full interactive Swagger docs: **http://localhost:5000/api/docs**

---

## 🧪 Testing the Real-Time Flow

1. Open **two browser windows** side by side.
2. Log in as **Admin** in window 1, navigate to **Access Requests**.
3. Log in as **Viewer** in window 2, click **Request Upgrade** in the sidebar.
4. ✅ Admin's page **instantly** shows the new request — no refresh.
5. Admin clicks **Approve**.
6. ✅ Viewer sees a success toast, is **automatically logged out**, and is redirected to login.
7. Viewer logs back in → fresh JWT → **new role** is active immediately.

---

<div align="center">
  <p>Built with ❤️ using Node.js, React, MongoDB & Socket.IO</p>
</div>
