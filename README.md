# ElevateHR — Employee Management Platform

ElevateHR is a secure, responsive, and premium web application built using a Node.js backend (Clean Architecture) and a Vite-React frontend (Tailwind CSS). The system integrates full Role-Based Access Control (RBAC), automatic Refresh Token Rotation, database aggregation pipelines, and secure profile photo uploads mediated through Cloudinary.

**🌐 Live Demo**: [https://elevatehr-p23n.onrender.com](https://elevatehr-p23n.onrender.com)

---

## 📂 Project Architecture (Monorepo)

```text
├── backend/               # Express API server (TypeScript + ESM)
│   ├── src/
│   │   ├── config/        # Mongoose connector, Cloudinary SDK setup
│   │   ├── controllers/   # Express request handlers
│   │   ├── middleware/    # Auth guards, Zod validators, error handling
│   │   ├── models/        # Mongoose data schemas (Employee, Tokens)
│   │   ├── routes/        # Router endpoint maps
│   │   ├── services/      # Business logic (DB queries, aggregations)
│   │   └── seed.ts        # Database seeding utility
│   └── package.json
│
├── frontend/              # Single-page client app (Vite + React + TS)
│   ├── src/
│   │   ├── components/    # Reusable UI elements (Modals, Shell frame)
│   │   ├── context/       # Auth session providers
│   │   ├── pages/         # View modules (Dashboard, Roster list, Settings)
│   │   └── utils/         # Fetch clients with interceptor queues
│   └── package.json
│
├── package.json           # Root orchestrator for multi-package builds
└── README.md
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript 6, Tailwind CSS v4, Lucide Icons, React Hot Toast, Vite
- **Backend**: Node.js, Express, TypeScript, Mongoose, Multer (Memory Storage)
- **Database**: MongoDB Atlas (Aggregation Pipelines)
- **Asset Storage**: Cloudinary (Secure Stream Uploads)
- **Validation**: Zod (Schema parsing)
- **Formatting**: Prettier

---

## 🔐 Role-Based Access Control Matrix

| Action                             | Allowed Roles                                               |
| :--------------------------------- | :---------------------------------------------------------- |
| **Access Dashboard Analytics**     | `HR`, `Manager`                                             |
| **View Employee Roster Directory** | `HR`, `Manager`                                             |
| **Add New Employee Accounts**      | `HR` only                                                   |
| **Delete Employee Accounts**       | `HR` only                                                   |
| **Modify Compensation / Roles**    | `HR` only                                                   |
| **Update Own Credentials**         | `HR`, `Manager`, `Employee` _(locked to self profile only)_ |
| **Upload Profile Avatar**          | `HR` _(any)_, `Manager`/`Employee` _(self profile only)_    |

---

## 📡 REST API Endpoint Specifications

All endpoints are prefixed with `/api/v1`.

### API Summary Table

| Method     | Endpoint               | Allowed Roles         | Description                                              | Request Body / Query Params                                                             |
| :--------- | :--------------------- | :-------------------- | :------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **POST**   | `/auth/login`          | Public                | Authenticates credentials & returns tokens               | `{ email, password }`                                                                   |
| **POST**   | `/auth/refresh`        | Public                | Rotates Access & Refresh tokens                          | `{ refreshToken }`                                                                      |
| **POST**   | `/auth/logout`         | Authenticated         | Clears active refresh tokens on database                 | `{ refreshToken }`                                                                      |
| **GET**    | `/employees`           | `HR`, `Manager`       | Lists employees (with pagination, sorting, filters)      | _Query: search, status, sortBy, sortOrder, page, limit_                                 |
| **POST**   | `/employees`           | `HR`                  | Registers a new employee profile                         | `{ name, email, password, department, designation, salary, role, status, joiningDate }` |
| **GET**    | `/employees/:id`       | `HR`, `Manager`, Self | Retrieves profile details of a single user               | None                                                                                    |
| **PATCH**  | `/employees/:id`       | `HR`, Self            | Updates employee parameters (Self locked to basic info)  | `{ name, email, password }` _(Self)_ or Full Entity _(HR)_                              |
| **PATCH**  | `/employees/:id/photo` | `HR`, Self            | Uploads profile picture to Cloudinary storage            | `multipart/form-data` _(field: `photo`)_                                                |
| **DELETE** | `/employees/:id`       | `HR`                  | Permanently deletes employee document                    | None                                                                                    |
| **GET**    | `/dashboard`           | `HR`, `Manager`       | Fetches active metrics, salary graphs, and joined counts | None                                                                                    |

### 1. Authentication Resource (`/auth`)

- **`POST /auth/login`**
  - **Description**: Authenticates users. Sets an HTTP-only secure cookie or returns tokens.
  - **Payload**:
    ```json
    {
      "email": "hr@company.com",
      "password": "password123"
    }
    ```
  - **Response**: `200 OK` returns Access Token, Refresh Token, and User metadata.

- **`POST /auth/refresh`**
  - **Description**: Issues a rotated token pair. Old refresh token is automatically invalidated.
  - **Payload**:
    ```json
    {
      "refreshToken": "uuid-string-token"
    }
    ```

- **`POST /auth/logout`**
  - **Description**: Invalidates the active refresh token session.
  - **Payload**: `refreshToken` inside body.

---

### 2. Employee Resource (`/employees`)

- **`GET /employees`**
  - **Description**: Queries employee rosters with sorting, limit-based pagination, and multi-faceted filters.
  - **Permissions**: `HR` or `Manager`.
  - **Query Parameters**:
    - `search` _(optional string)_: Filters by Name/Email
    - `department` _(optional string)_: E.g., `Engineering`, `Marketing`
    - `status` _(optional string)_: `Active`, `Inactive`, `Terminated`
    - `sortBy` _(optional)_: E.g., `salary`, `joiningDate`, `name`
    - `sortOrder` _(optional)_: `asc` or `desc`
    - `page` _(default 1)_ & `limit` _(default 8)_

- **`POST /employees`**
  - **Description**: Creates a new employee.
  - **Permissions**: `HR` only.
  - **Payload**: Includes `name`, `email`, `password`, `department`, `designation`, `salary`, `joiningDate`, `role`, and `status`.

- **`GET /employees/:id`**
  - **Description**: Returns detailed single profile data.
  - **Permissions**: `HR`, `Manager`, or requesting user matching `:id`.

- **`PATCH /employees/:id`**
  - **Description**: Updates profile details.
  - **Permissions**:
    - `HR` can modify all parameters.
    - `Manager` / `Employee` matching `:id` can only update their own basic details (`name`, `email`, `password`). Administrative keys (`role`, `salary`, `status`, `department`) are locked out.

- **`PATCH /employees/:id/photo`**
  - **Description**: Uploads profile picture.
  - **Permissions**: `HR`, or user matching `:id`.
  - **Format**: `multipart/form-data` with form field key `photo` holding the image file.
  - **Response**: `200 OK` returning updated model metadata containing the Cloudinary secure URL.

- **`DELETE /employees/:id`**
  - **Description**: Permanently removes an employee.
  - **Permissions**: `HR` only.

---

### 3. Dashboard Resource (`/dashboard`)

- **`GET /dashboard`**
  - **Description**: Runs aggregate parallel operations returning:
    - Active counters (Total, Active, Inactive staff)
    - Department headcounts
    - Compensation summary (Average salary, top earner index)
    - Staff joining benchmarks this month
  - **Permissions**: `HR` or `Manager`.

---

## ⚡ Development Setup

### Prerequisite Environment

Create a `backend/.env` file with the following keys:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_signing_key_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_signing_key_secret
REFRESH_TOKEN_EXPIRES_IN=7d

CLOUDINARY_CLOUDNAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET=
```

### Installation

From the root workspace folder, install all package packages:

```bash
npm run build
```

_(This triggers recursive installs, bundles Vite components, and builds the TS backend)_.

### Database Seeding

To populate initial test roles for HR (`hr@company.com`), Manager (`manager@company.com`), and Employee (`employee@company.com`):

```bash
cd backend
npm run seed
```

### Run Servers

1.  **Backend** (Runs on port `5000`):
    ```bash
    cd backend
    npm run dev
    ```
2.  **Frontend** (Vite Dev Server on port `5173`):
    ```bash
    cd frontend
    npm run dev
    ```

---

## ☁️ Render Production Deployment Guide

Deploy the entire monorepo as a single **Web Service** on Render:

1.  **Create Service**: Link your repository to a new Render Web Service.
2.  **Configure Commands**:
    - **Build Command**: `npm run build` _(compiles backend and bundles frontend to static files)_
    - **Start Command**: `npm start` _(starts Express server)_
3.  **Environment Variables**: Add your `.env` variables in Render's Advanced Settings (`NODE_ENV` must be set to `production`).
4.  **Static Fallback Routing**: Express automatically serves the static React assets from `frontend/dist` on the root domain, forwarding API requests to `/api/v1/*`.
