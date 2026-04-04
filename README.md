# FinanceOS — Dashboard & Management System

A modern, full-stack finance dashboard and management system built with **Node.js, Express, MongoDB, and React**. This project demonstrates advanced backend patterns, robust Role-Based Access Control (RBAC), and high-performance data processing.

## 🚀 Key Features

- **🔐 Robust RBAC**: Specialized access levels for **Admin**, **Analyst**, and **Viewer**.
- **📊 Real-time Analytics**: Monthly trend analysis and category-wise spending using MongoDB aggregation pipelines.
- **💼 Records Management**: Full CRUD with soft-delete support and advanced filtering (Type, Category, Date range).
- **👥 User Management**: Admins can manage team members, status, and role assignments.
- **📄 API Documentation**: interactive Swagger/OpenAPI documentation (available at `/api/docs`).
- **🛡 Security**: JWT-based authentication, password hashing with bcrypt, rate limiting, and helmet security headers.

## 🛠 Tech Stack

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Validation**: Joi & express-validator
- **Security**: JWT & BcryptJS
- **API Specs**: Swagger / OpenAPI 3.0

### **Frontend**
- **Library**: React 19 (TypeScript)
- **Styling**: Vanilla CSS (Modern Design System)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router 7

---

## 🔑 Demo Accounts

To test the Role-Based Access Control features after running the seeder (`npm run seed`), use the following credentials:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@finance.com` | `Admin123!` | Full access (Users, Dashboard, Records, Trash, Analytics) |
| **Analyst** | `analyst@finance.com` | `Analyst123!` | Can view and edit records, view analytics, no user management |
| **Viewer** | `viewer@finance.com` | `Viewer123!` | Can view dashboard and records only. Cannot add/edit/delete |

---

## ⚙️ Setup & Installation

### **1. Prerequisites**
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### **2. Backend Setup**
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file from the provided example:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   CLIENT_ORIGIN=http://localhost:5173
   ```
4. Seed the database with demo data:
   `npm run seed`
5. Start the server:
   `npm run dev`

### **3. Frontend Setup**
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the development server:
   `npm run dev`

---

## 🏛 Architecture & Design Choices

### **Role-Based Access Control (RBAC)**
Access control is implemented in three layers:
1. **Database Layer**: Every record is linked to its creator via `createdBy`.
2. **Middleware Layer**: The `authenticate` and `authorize` middlewares verify JWTs and check role permissions before any business logic executes.
3. **UI Layer**: The `ProtectedRoute` and `RoleGate` components ensure users only see the features they are allowed to use.

### **Data Processing**
The dashboard uses MongoDB's **Aggregation Framework** to process thousands of records into summary-level insights (Totals, Trends, Categories) in a single database round-trip, ensuring fast load times.

### **Soft Delete**
We utilize a soft-delete pattern (`isDeleted: true`) on financial records. This ensures data integrity and allows for auditing while keeping the active dashboard views clean.

---

## 📖 API Documentation
Once the server is running, you can explore the full API documentation at:
`http://localhost:5000/api/docs`
