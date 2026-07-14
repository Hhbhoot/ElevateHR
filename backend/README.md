# Employee Management System API

A scalable Employee Management REST API built using **Node.js (TypeScript)**, **Express.js**, and **MongoDB (Mongoose)**, featuring clean MVC architecture, role-based access control (RBAC), advanced filter/sort/pagination querying, and real-time dashboard analytics.

---

## Technical Stack & Features

- **Runtime & Language**: Node.js (ES Modules) & TypeScript (`tsconfig.json` target `ES2022`).
- **Framework**: Express.js with custom error handler middleware and standard JSON structure response formats.
- **Database & Modelling**: MongoDB via Mongoose with validation hooks, unique constraints, and database indexing.
- **Development Tooling**: `tsx` for high-performance watch-mode running without manual compilation step.
- **Validation**: Request inputs checked via `Zod` schemas before hitting controllers.
- **Authentication**: JWT token-based authorization with refresh tokens, database persistence, and token rotation (security replay mitigation).
- **Authorization**: Granular role-based authorization rules mapped across endpoints.

---

## Directory Structure

```text
backend/
├── src/
│   ├── config/             # Database connection & Zod env validation loaders
│   ├── constants/          # Application enums and constant definitions
│   ├── controllers/        # Express handlers (orchestrate services & parse requests)
│   ├── errors/             # Custom operational error classes (AppError)
│   ├── middleware/         # Auth, validation, logging, global error handler
│   ├── models/             # Mongoose Schemas (Employee, RefreshToken)
│   ├── routes/             # Modular routers (index, auth, employee, dashboard)
│   ├── services/           # Core business logic, queries, and aggregations
│   ├── utils/              # Validators (Zod schemas), utilities
│   ├── app.ts              # Express App configurations (middlewares, routes)
│   ├── server.ts           # Bootstraps connection & launches HTTP listener
│   └── seed.ts             # Local database mock data populating script
├── package.json            # Scripts and dependencies definitions
└── tsconfig.json           # TypeScript configuration
```

---

## Installation & Running

### 1. Requirements
- Node.js (v18+)
- MongoDB running locally at `mongodb://localhost:27017` (or change `MONGO_URI` in `.env`)

### 2. Setup Dependencies
```bash
npm install
```

### 3. Setup Environment Configuration
A `.env` file should be located at the root of the `backend/` directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/employee_management
JWT_SECRET=super-secret-access-token-key-change-in-production-12345
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=super-secret-refresh-token-key-change-in-production-12345
REFRESH_TOKEN_EXPIRES_IN=7d
```

### 4. Database Seeding
To populate mock employees and default role credentials:
```bash
npm run seed
```

### 5. Running in Development Mode
To boot up the live server with hot-reloading:
```bash
npm run dev
```

### 6. Production Compilation & Start
```bash
npm run build
npm start
```

---

## Role-Based Access Control Matrix

| Endpoint | Method | Allowed Roles | Access Rules |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | POST | All | Public |
| `/api/v1/auth/refresh` | POST | All | Public |
| `/api/v1/auth/logout` | POST | All | Public (must supply token) |
| `/api/v1/employees` | POST | HR | Register a new employee |
| `/api/v1/employees` | GET | HR, Manager | Retrieve list with filtering/sorting/pagination |
| `/api/v1/employees/:id` | GET | All | Employees can only view their own record; HR & Managers view any |
| `/api/v1/employees/:id` | PATCH | HR, Employee | Employee can only update own basic details (`name`, `email`, `password`); HR can update everything; Manager is read-only |
| `/api/v1/employees/:id` | DELETE | HR | Permanent record deletion |
| `/api/v1/dashboard` | GET | HR, Manager | Enterprise stats aggregate analytics |

---

## API Documentation

### Response Standards
All responses conform to a unified format.

#### Successful Responses
```json
{
  "success": true,
  "message": "Action was successful (optional)",
  "data": { ... },
  "pagination": { ... } // (Optional: Only on list queries)
}
```

#### Failed Responses
```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message",
    "details": [ ... ] // (Optional: e.g. validation feedback array)
  }
}
```

---

### Endpoints Details

### 1. Authentication

#### Login
- **Endpoint**: `/api/v1/auth/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "hr@company.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "employee": {
        "_id": "64bfbc22d4f828a2a0...",
        "name": "HR Manager",
        "email": "hr@company.com",
        "department": "Human Resources",
        "designation": "HR Lead",
        "salary": 75000,
        "joiningDate": "2026-05-14T17:22:35.000Z",
        "status": "Active",
        "role": "HR",
        "createdAt": "...",
        "updatedAt": "..."
      },
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
  ```

#### Refresh Token
- **Endpoint**: `/api/v1/auth/refresh`
- **Method**: `POST`
- **Description**: Rotates the existing refresh token for security, returning a new Access/Refresh token pair.
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Tokens rotated successfully",
    "data": {
      "accessToken": "newAccessTokenEy...",
      "refreshToken": "newRefreshTokenEy..."
    }
  }
  ```

#### Logout
- **Endpoint**: `/api/v1/auth/logout`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```

---

### 2. Employee CRUD

#### Create Employee
- **Endpoint**: `/api/v1/employees`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Role Required**: `HR`
- **Request Body**:
  ```json
  {
    "name": "David Smith",
    "email": "david.s@company.com",
    "password": "securepassword123",
    "department": "Engineering",
    "designation": "Backend Engineer",
    "salary": 85000,
    "joiningDate": "2026-07-14",
    "status": "Active",
    "role": "Employee"
  }
  ```

#### Get Employee List
- **Endpoint**: `/api/v1/employees`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Role Required**: `HR` or `Manager`
- **Query Parameters (Optional)**:
  - `search` (Search name case-insensitively, e.g. `?search=john`)
  - `department` (Filter by department, e.g. `?department=Engineering`)
  - `status` (Filter by status, e.g. `?status=Active`)
  - `sortBy` (Options: `salary`, `joiningDate`, `createdAt`, default `createdAt`)
  - `sortOrder` (Options: `asc`, `desc`, default `desc`)
  - `page` (Page number, default `1`)
  - `limit` (Records per page, default `10`)
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "...",
        "name": "Jane Smith",
        "email": "jane.smith@company.com",
        "department": "Engineering",
        "designation": "Senior Developer",
        "salary": 95000,
        "joiningDate": "2026-07-05T00:00:00.000Z",
        "status": "Active",
        "role": "Employee"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "totalEmployees": 1
    }
  }
  ```

#### Get Employee Details
- **Endpoint**: `/api/v1/employees/:id`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Role Required**: `HR`, `Manager`, or `Employee` (Employees can only view their own profile).

#### Update Employee Details
- **Endpoint**: `/api/v1/employees/:id`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Role Required**: `HR` or `Employee` (Employees can only update their own record and are limited to `name`, `email`, and `password`).

#### Delete Employee
- **Endpoint**: `/api/v1/employees/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Role Required**: `HR`

---

### 3. Dashboard Statistics

- **Endpoint**: `/api/v1/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Role Required**: `HR` or `Manager`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalEmployees": 9,
      "activeEmployees": 7,
      "departmentWiseCount": [
        {
          "count": 4,
          "department": "Engineering"
        },
        {
          "count": 2,
          "department": "Marketing"
        },
        {
          "count": 2,
          "department": "Sales"
        },
        {
          "count": 1,
          "department": "Human Resources"
        }
      ],
      "averageSalary": 76666.67,
      "highestPaidEmployee": {
        "_id": "64bfbc22d4f828a2a08892d3",
        "name": "Engineering Manager",
        "email": "manager@company.com",
        "department": "Engineering",
        "designation": "Tech Lead",
        "salary": 120000,
        "joiningDate": "2026-06-15T00:00:00.000Z",
        "status": "Active",
        "role": "Manager",
        "createdAt": "2026-07-14T17:22:35.000Z",
        "updatedAt": "2026-07-14T17:22:35.000Z"
      },
      "employeesJoinedThisMonth": 3
    }
  }
  ```
