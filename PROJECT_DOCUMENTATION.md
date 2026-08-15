# Engenheim Sales Department System — Complete Project Documentation

> **Project Name:** engenheim-system (sale-systmy)  
> **Company:** Engenheim  
> **Purpose:** Internal sales department management system for tracking companies/leads, employee performance, call center operations, and deal closures.  
> **Language:** Arabic (RTL interface), English code  
> **Status:** ⚠️ UNFINISHED — Frontend is mostly built, backend is incomplete/broken and needs to be rebuilt with an online database.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [User Roles & Authentication](#4-user-roles--authentication)
5. [Pages & Their Functionality](#5-pages--their-functionality)
6. [Data Models](#6-data-models)
7. [API Endpoints](#7-api-endpoints)
8. [Current State & Known Issues](#8-current-state--known-issues)
9. [What Needs To Be Built (Backend Roadmap)](#9-what-needs-to-be-built-backend-roadmap)
10. [File-by-File Breakdown](#10-file-by-file-breakdown)

---

## 1. Project Overview

This is an **internal sales management system** for the company **Engenheim**. The system is designed to:

- Allow an **Admin (Manager)** to add companies/leads into the system and assign them to sales employees.
- Allow **Sales Employees** (up to 5) to view the companies assigned to them, make calls, track call counts, update deal statuses, and work toward meeting their sales targets.
- Provide a **Call Center view** where all companies can be seen and managed with quick call/status actions.
- Provide a **Company Search page** to find new companies via external APIs (currently simulated) and assign them to employees.
- Track **KPIs** like total companies, deals done, deals failed, meetings scheduled, total calls, and per-employee target achievement percentages.

### Core Workflow

```
Admin logs in → Adds companies (name, phone, address, status) → Assigns to an Employee
     ↓
Employee logs in → Sees their assigned companies → Makes calls → Updates status (NoDeal/Deal/Meeting/Called)
     ↓
Admin Dashboard shows live stats: total companies, deals, meetings, calls, employee target progress
```

---

## 2. Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | Page structure (all pages are standalone `.html` files) |
| **CSS3 (inline `<style>`)** | Styling — dark theme with green (#00ff66) accent, RTL layout |
| **Vanilla JavaScript** | All logic, API calls, DOM manipulation |
| **localStorage** | Stores employee accounts, login state, user role (client-side) |
| **Fetch API** | Communicates with the backend REST API |

### Backend (Partially Built / Broken)
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express.js v5** | HTTP server and REST API framework |
| **Mongoose v9** | MongoDB ODM (Object Data Modeling) — models exist but are NOT connected |
| **bcryptjs** | Password hashing for user accounts |
| **jsonwebtoken (JWT)** | Token-based authentication (routes exist but NOT integrated with frontend) |
| **cors** | Cross-Origin Resource Sharing middleware |
| **dotenv** | Environment variable loading (`.env` file is MISSING) |
| **nodemon** | Dev dependency for auto-restarting server |

### Database
| Intended | Current |
|---|---|
| **MongoDB** (via Mongoose) | ❌ NOT connected. The `server.js` currently uses a **local JSON file** (`companies.json`) as a flat-file database instead. Mongoose models exist but are orphaned. |

---

## 3. Folder Structure

```
sailes/
├── .vscode/
│   └── settings.json          # VS Code config (Live Server port: 5501)
├── models/
│   ├── company.js             # Mongoose schema for Company (NOT used by server.js)
│   ├── user.js                # Mongoose schema for User (NOT used by server.js)
│   └── routes/
│       ├── auth.js            # Express router: Register & Login with JWT (NOT mounted)
│       ├── companies.js       # Express router: CRUD for companies via Mongoose (NOT mounted)
│       └── createadmin.js     # Standalone script to seed admin + 5 employees into MongoDB (NOT functional without DB)
├── node_modules/              # npm dependencies (installed)
├── .git/                      # Git repository
├── callcenter.html            # Call Center management page (Admin)
├── companies.json             # Flat-file "database" — currently stores company data as JSON array (empty: [])
├── dashboard.html             # Admin Dashboard — main control panel
├── employeedash.html          # Employee Dashboard — shows assigned companies
├── employeedashfor.html       # DUPLICATE of employeedash.html (exact same code, likely a backup/variant)
├── index.html                 # Login page — entry point of the application
├── search-companies.html      # Company search engine page (simulated external API search)
├── server.js                  # Express server — serves static files + JSON-based REST API
├── package.json               # npm project config
└── package-lock.json          # npm dependency lock file
```

---

## 4. User Roles & Authentication

### Current Authentication (localStorage-based — NOT secure)

The system currently uses **hardcoded credentials stored in `localStorage`**. There is NO server-side authentication active.

#### Admin Account
| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |
| Redirects to | `dashboard.html` |

#### Employee Accounts (5 default employees)
| Username | Password | Target (deals) |
|---|---|---|
| `emp1` | `1234` | 20 |
| `emp2` | `1234` | 20 |
| `emp3` | `1234` | 25 |
| `emp4` | `1234` | 15 |
| `emp5` | `1234` | 30 |

- Employee accounts are initialized in `localStorage` under the key `ingenheim_employees` on first visit to `index.html`.
- The Admin can change employee passwords and targets from the Admin Dashboard — changes are saved to `localStorage`.
- Employees are redirected to `employeedash.html` on login.

#### Auth Flow
1. User enters username + password on `index.html`.
2. JavaScript checks if username/password matches `admin/admin123` → redirect to `dashboard.html`.
3. If not admin, it checks the `ingenheim_employees` array in `localStorage` for a match → redirect to `employeedash.html`.
4. If neither matches → shows error alert.
5. Each protected page checks `localStorage` for `isLoggedIn` and `userRole` on load, and redirects to `index.html` if unauthorized.

#### Server-Side Auth (EXISTS but NOT connected)
- `models/routes/auth.js` contains full Register and Login routes using bcrypt + JWT.
- `models/user.js` has a Mongoose User schema.
- `models/routes/createadmin.js` is a seeder script to create 6 users (1 admin + 5 employees) in MongoDB.
- **None of these are mounted in `server.js`** — they are orphaned code.

---

## 5. Pages & Their Functionality

### 5.1 `index.html` — Login Page
- **URL:** Root page / entry point
- **Title:** "تسجيل الدخول - Engenheim System" (Login - Engenheim System)
- **Layout:** Centered login card on dark background
- **Fields:** Username, Password
- **Functionality:**
  - Initializes 5 default employee accounts in `localStorage` if not present
  - Validates credentials against hardcoded admin or `localStorage` employees
  - Sets `isLoggedIn`, `userRole`, and `currentEmpUser` in `localStorage`
  - Redirects admin → `dashboard.html`, employee → `employeedash.html`

---

### 5.2 `dashboard.html` — Admin Dashboard (Main Control Panel)
- **Access:** Admin only (checked via `localStorage`)
- **Title:** "لوحة تحكم الأدمن - Engenheim System" (Admin Control Panel)
- **Layout:** Sidebar + Topbar + Main content area

#### Sidebar Navigation Links:
- لوحة الأدمن الرئيسية (Admin Dashboard) — `dashboard.html` ✅ Active
- نظام الكول سنتر (Call Center) — `callcenter.html`
- نظام البحث عن الشركات (Company Search) — `search-companies.html`

#### Sections:

**A. Statistics Grid (5 stat cards):**
| Stat | ID | Description |
|---|---|---|
| إجمالي الشركات (Total Companies) | `totalCompanies` | Count of all companies in the system |
| الصفقات الناجحة (Successful Deals) | `dealsDone` | Companies with status "Deal" |
| لم يتم الديل (Failed Deals) | `dealsFailed` | Companies with status "NoDeal" |
| الاجتماعات (Meetings) | `totalMeetings` | Companies with status "Meeting" |
| إجمالي المكالمات (Total Calls) | `weekCalls` | Sum of all `callCount` across all companies |

**B. Add New Company Form:**
- Fields: Company Name, Phone, Address, Status (dropdown), Assigned Employee (dropdown populated from `localStorage` employees)
- Status options: `Deal`, `NoDeal` (default), `Meeting`, `Called`
- On submit: sends `POST /api/companies` to server, then reloads data

**C. Employee Management Table:**
- Shows all 5 employees with editable password and target fields
- Displays: deals achieved per employee, achievement percentage with progress bar
- "Update" button saves changes to `localStorage`

**D. Companies List Table:**
- Shows all companies from server: name, phone, address, status, assigned agent, call count
- Delete button per company → `DELETE /api/companies/:id`

**E. Smart Text Analyzer (🤖):**
- A textarea where admin can paste raw message text
- "Analyze" button extracts: company name (first line), address (looks for Iraqi city names), note (full text)
- Shows editable results in a table with fields: name, address, note, phone, Instagram, assigned employee
- "Save & Assign" button sends `POST /api/companies` to server

---

### 5.3 `employeedash.html` — Employee Dashboard
- **Access:** Employee only (checked via `localStorage`)
- **Title:** "لوحة تحكم الموظف - Engenheim System" (Employee Control Panel)
- **Layout:** Sidebar + Topbar + Main content

#### Statistics (4 stat cards):
| Stat | ID | Description |
|---|---|---|
| الشركات المسندة إليك (Your Assigned Companies) | `myTotalCompanies` | Count of companies where `agent` matches current employee |
| عدد الصفقات المحققة (Deals Done) | `myDealsDone` | Companies with status "Deal" for this employee |
| نسبة إنجاز التارجت (Target Progress %) | `myProgressPercent` | `(deals / target) * 100`, capped at 100% |
| إجمالي مكالماتك (Your Total Calls) | `myTotalCalls` | Sum of `callCount` for this employee's companies |

#### Companies Table:
- Shows only companies assigned to the logged-in employee
- Columns: Company Name, Phone, Address, Call Count, Status (dropdown), Quick Actions
- **Quick Actions per company:**
  - 📞 "Register Call" button → `PUT /api/companies/:id` incrementing `callCount` by 1
  - ✅ "Deal Done" button → `PUT /api/companies/:id` setting `status` to "Deal"
  - Status dropdown → `PUT /api/companies/:id` changing status to selected value

#### Data Flow:
1. Fetches ALL companies from `GET /api/companies`
2. Filters client-side where `company.agent === currentEmpUser`
3. Gets employee target from `localStorage` (`ingenheim_employees`)
4. Calculates and displays stats

---

### 5.4 `employeedashfor.html` — Employee Dashboard (Duplicate)
- **This is an EXACT copy of `employeedash.html`** — same HTML, same CSS, same JavaScript.
- Likely created as a backup or an unfinished variant. No functional difference.

---

### 5.5 `callcenter.html` — Call Center Management
- **Access:** Any logged-in user (only checks `isLoggedIn`)
- **Title:** "نظام الكول سنتر - Engenheim System" (Call Center System)
- **Layout:** Sidebar + Topbar + Main content

#### Functionality:
- Displays ALL companies in one table (not filtered by employee)
- Columns: Company Name, Phone, Address, Assigned Employee, Call Count, Status (dropdown), Quick Actions
- Same action buttons as employee dashboard: Register Call, Deal Done, Status Change
- Sidebar links: Admin Dashboard, Call Center (active)

---
   
### 5.6 `search-companies.html` — Company Search Engine
- **Access:** Not protected (no auth check in JavaScript)
- **Title:** "نظام البحث عن الشركات - Engenheim System" (Company Search System)
- **Uses Google Font:** Tajawal (Arabic font)

#### Functionality:
- **Local Filter:** Type in search box → filters table rows by text content in real-time
- **External API Search (Simulated):** "Search via Platforms (API)" button adds a fake row to the table pretending it came from Facebook/Instagram Graph API
- **Company Assignment:** Each row has a dropdown of employee names + "Assign" button → currently just shows an alert, does NOT actually save to server

#### Hardcoded Employee Names in Dropdowns:
- أحمد (Ahmed), عباس (Abbas), أمير (Ameer), شاهين (Shaheen), موسى (Mousa)
- ⚠️ These names do NOT match the `emp1-emp5` usernames used elsewhere in the system

#### Sample Data (Hardcoded in HTML):
1. شركة النخيل للتمور العراقية — Baghdad, Karada — Source: Baghdad Directory
2. مؤسسة دجلة للتجارة العامة — Baghdad, Mansour — Source: Instagram API

---

## 6. Data Models

### 6.1 Company Data (As Used by `server.js` — JSON file)

The active server stores companies in `companies.json` with this structure:

```json
{
    "id": "1723456789000",       // String — generated via Date.now().toString()
    "name": "Company Name",      // String — company name
    "phone": "07xxxxxxxx",       // String — phone number
    "address": "Baghdad",        // String — company address
    "status": "NoDeal",          // String — one of: "Deal", "NoDeal", "Meeting", "Called"
    "agent": "emp1",             // String — username of assigned employee
    "callCount": 0,              // Number — how many times the company was called
    "note": "optional note",     // String (optional) — notes about the company
    "instagram": "@handle"       // String (optional) — Instagram account
}
```

### 6.2 Company Model (Mongoose — `models/company.js` — NOT in use)

```javascript
{
    companyName: String,        // required
    address: String,            // required
    phone: String,              // required
    status: String,             // enum: ['Pending', 'Called', 'Agreed', 'Rejected', 'Meeting'], default: 'Pending'
    assignedTo: ObjectId,       // ref: 'User', required — references a User document
    createdAt: Date             // default: Date.now
}
```

> ⚠️ **Mismatch:** The Mongoose model uses different field names (`companyName` vs `name`), different status values (`Pending/Agreed/Rejected` vs `Deal/NoDeal`), and references users by MongoDB ObjectId instead of username string.

### 6.3 User Model (Mongoose — `models/user.js` — NOT in use)

```javascript
{
    name: String,               // required — display name
    email: String,              // required, unique — login email
    password: String,           // required — bcrypt hashed password
    role: String,               // enum: ['admin', 'employee'], default: 'employee'
    createdAt: Date             // default: Date.now
}
```

### 6.4 Employee Data (localStorage — currently active)

Stored under key `ingenheim_employees`:
```json
[
    { "username": "emp1", "pass": "1234", "target": 20 },
    { "username": "emp2", "pass": "1234", "target": 20 },
    { "username": "emp3", "pass": "1234", "target": 25 },
    { "username": "emp4", "pass": "1234", "target": 15 },
    { "username": "emp5", "pass": "1234", "target": 30 }
]
```

---

## 7. API Endpoints

### Active Endpoints (in `server.js` — working with JSON file)

| Method | URL | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/api/companies` | Get all companies (optionally filter by `?agent=emp1`) | — | `Company[]` |
| `POST` | `/api/companies` | Add a new company | `{ name, phone, address, status, agent, callCount, note?, instagram? }` | Created company with generated `id` |
| `PUT` | `/api/companies/:id` | Update a company (status, callCount, or any field) | `{ status?, callCount?, ... }` | Updated company |
| `DELETE` | `/api/companies/:id` | Delete a company by ID | — | `{ message: 'Deleted successfully' }` |

> ⚠️ **Bug:** `server.js` has a DUPLICATE `POST /api/companies` route at line 71-86 that is incomplete (no response sent, just defines the object shape). Express will use the first matching route, so this second one is dead code.

### Inactive Endpoints (in `models/routes/` — NOT mounted in server.js)

**Auth Routes (`models/routes/auth.js`):**
| Method | URL | Description |
|---|---|---|
| `POST` | `/register` | Register new user (name, email, password, role) with bcrypt hashing |
| `POST` | `/login` | Login with email + password, returns JWT token + user info |

**Companies Routes (`models/routes/companies.js`):**
| Method | URL | Description |
|---|---|---|
| `POST` | `/add` | Add new company assigned to a user (by ObjectId) |
| `GET` | `/my-companies/:userId` | Get companies assigned to a specific user |
| `PUT` | `/update-status/:id` | Update company status |
| `GET` | `/all` | Get all companies with populated user info |

> ⚠️ **Bug in `models/routes/companies.js`:** Line 2 imports `require('../models/Company')` but the actual file path is `../company.js` (lowercase, and no nested `models/` folder from routes perspective). This would crash if mounted.

---

## 8. Current State & Known Issues

### ✅ What Works
- Login page with hardcoded authentication (localStorage)
- Admin dashboard UI: stats, add company form, employee table, companies list, smart text analyzer
- Employee dashboard UI: stats, company table with actions
- Call center UI: full company table with actions
- REST API for CRUD operations on companies (via `companies.json` flat file)
- Serving static HTML files via Express

### ❌ What Does NOT Work / Is Missing

| Issue | Severity | Details |
|---|---|---|
| **No real database** | 🔴 Critical | Uses `companies.json` flat file — no concurrency, no persistence guarantees, will lose data |
| **No online backend** | 🔴 Critical | Server runs on `localhost:3000` only — not deployed anywhere |
| **No `.env` file** | 🟡 Medium | `dotenv` is imported in package.json but no `.env` file exists, no MongoDB URI configured |
| **Mongoose not connected** | 🔴 Critical | `server.js` doesn't import mongoose or connect to any database |
| **Auth routes not mounted** | 🔴 Critical | JWT auth system exists in code but is not used by `server.js` |
| **Company routes not mounted** | 🔴 Critical | Mongoose-based CRUD routes exist but are not used |
| **Duplicate POST route** | 🟡 Medium | `server.js` has two `POST /api/companies` handlers; second one is dead code |
| **localStorage for auth** | 🔴 Critical | All auth is client-side — anyone can access any page by editing localStorage |
| **Employee name mismatch** | 🟡 Medium | `search-companies.html` uses Arabic names (أحمد, عباس) while rest of system uses `emp1-emp5` |
| **search-companies.html doesn't save** | 🟡 Medium | "Assign" button only shows alert, doesn't actually POST to server |
| **No password security** | 🔴 Critical | Passwords stored in plain text in localStorage |
| **employeedashfor.html is a duplicate** | 🟢 Low | Exact copy of `employeedash.html`, serves no purpose |
| **createadmin.js wrong path** | 🟡 Medium | Imports `require('./models/User')` but is itself inside `models/routes/` — path is wrong |
| **No input validation** | 🟡 Medium | No server-side validation on any endpoint |
| **No error handling in frontend** | 🟡 Medium | `fetch` calls have no `.catch()` for network errors |

---

## 9. What Needs To Be Built (Backend Roadmap)

### Phase 1: Online Database Setup
- Set up a **MongoDB Atlas** (free cloud MongoDB) or equivalent online database
- Create `.env` file with `MONGODB_URI` and `JWT_SECRET`
- Connect Mongoose in `server.js`

### Phase 2: Unify Data Models
- Align the Mongoose `Company` schema with the fields the frontend actually uses (`name`, `phone`, `address`, `status`, `agent`, `callCount`, `note`, `instagram`)
- Fix status enum to match frontend: `Deal`, `NoDeal`, `Meeting`, `Called`
- Decide: reference employees by username string or by MongoDB ObjectId

### Phase 3: Auth System
- Mount `auth.js` routes in `server.js`
- Switch frontend from localStorage auth to JWT token-based auth
- Add middleware to protect API routes
- Store employee data (including targets) in the database instead of localStorage

### Phase 4: API Migration
- Replace JSON file-based CRUD with Mongoose-based routes
- Remove duplicate POST route
- Add proper error handling and input validation

### Phase 5: Deploy
- Deploy server to a cloud platform (Render, Railway, Vercel, etc.)
- Update all frontend `fetch()` calls to point to the deployed API URL
- Host frontend (can be on same server since Express serves static files)

---

## 10. File-by-File Breakdown

### `package.json`
- **Project name:** `sale-systmy`
- **Entry point:** `index.js` (⚠️ should be `server.js`)
- **Scripts:** `start` → `node server.js`, `dev` → `nodemon server.js`
- **Dependencies:** express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv
- **Dev dependencies:** nodemon

### `server.js` (88 lines)
- Creates Express app with JSON body parser and CORS
- Serves all files in project root as static files
- Implements 4 REST endpoints using `companies.json` as storage
- Has a duplicate incomplete POST route (dead code)
- Listens on port 3000
- **Does NOT:** connect to MongoDB, mount auth/company routes, use dotenv, use any middleware for auth

### `models/company.js` (20 lines)
- Mongoose schema for Company with fields: companyName, address, phone, status, assignedTo (ObjectId ref to User), createdAt
- Status enum: Pending, Called, Agreed, Rejected, Meeting
- **NOT used** by the active server

### `models/user.js` (11 lines)
- Mongoose schema for User with fields: name, email, password, role, createdAt
- Role enum: admin, employee
- **NOT used** by the active server

### `models/routes/auth.js` (66 lines)
- Express router with `/register` and `/login` endpoints
- Uses bcrypt for password hashing, JWT for token generation
- JWT secret is hardcoded as `'your_jwt_secret_key_here'`
- **NOT mounted** in server.js

### `models/routes/companies.js` (59 lines)
- Express router with `/add`, `/my-companies/:userId`, `/update-status/:id`, `/all` endpoints
- Uses Mongoose Company model for all operations
- `/all` populates the `assignedTo` field with user name and email
- **NOT mounted** in server.js
- **Bug:** Import path `../models/Company` is incorrect

### `models/routes/createadmin.js` (78 lines)
- Standalone Node.js script (not a route)
- Connects to `mongodb://localhost:27017/sales_dashboard`
- Creates 6 users: 1 admin + 5 employees (عباس, أحمد, أمير, sales 1, sales 2)
- All passwords: `123456` (hashed with bcrypt before saving)
- **Bug:** Import path `./models/User` is incorrect from its actual location
- **Bug:** `sales1 @system.com` and `msales2 @system.com` have spaces in email addresses

### `index.html` (83 lines)
- Login page with dark theme, centered card
- Initializes default employees in localStorage
- Validates admin credentials (hardcoded) and employee credentials (from localStorage)
- Sets auth state in localStorage and redirects

### `dashboard.html` (427 lines)
- Admin control panel — largest and most complex page
- Contains: stats grid, add company form, employee management table, companies list, smart text analyzer
- Fetches data from `/api/companies` API
- Employee data comes from localStorage
- Smart text analyzer: paste text → extract company name/address → fill editable form → save to server

### `employeedash.html` (214 lines)
- Employee dashboard showing only their assigned companies
- Fetches all companies from API, filters by `agent === currentEmpUser`
- Shows stats: assigned companies, deals done, target progress %, total calls
- Actions: register call (increment callCount), mark deal, change status

### `employeedashfor.html` (214 lines)
- **EXACT DUPLICATE** of `employeedash.html` — identical in every way

### `callcenter.html` (167 lines)
- Shows ALL companies regardless of assigned employee
- Same action buttons as employee dashboard
- Used by call center supervisor to manage all calls

### `search-companies.html` (180 lines)
- Company search engine with real-time text filtering
- Simulated external API search (adds fake rows to table)
- Assignment dropdown with hardcoded Arabic employee names
- Assign button only shows alert — does NOT save to backend
- Uses Google Font "Tajawal" (only page with external font)

### `companies.json` (1 line)
- Currently contains empty array: `[]`
- Used as flat-file database by `server.js`

### `.vscode/settings.json` (3 lines)
- Sets Live Server port to 5501

---

## Design & UI Theme

All pages share a consistent dark theme:

| Element | Color |
|---|---|
| Background | `#0b0f0d` (near black) |
| Sidebar / Cards | `#121814` (dark green-black) |
| Borders | `#1f3324` (dark green) |
| Primary Accent | `#00ff66` (bright green) |
| Text | `#e0e0e0` (light gray) |
| Secondary Text | `#8a9990` / `#a3b8ac` (muted green-gray) |
| Danger / Delete | `#ff4d4d` (red) |
| Hover States | `#17221a` (slightly lighter dark) |
| Font | Segoe UI, Tahoma, Geneva, Verdana, sans-serif |

Layout: RTL (right-to-left), sidebar on right, main content on left.

---

## Summary for Collaborators

> **If you're working on this project, here's what you need to know:**
>
> 1. The **frontend is mostly done** — 6 HTML pages with full UI and JavaScript logic.
> 2. The **backend is broken** — `server.js` uses a local JSON file instead of a real database. Mongoose models and auth routes exist but are NOT connected.
> 3. The frontend communicates with the server via `fetch('/api/companies')` for all CRUD operations.
> 4. Authentication is currently **100% client-side** using `localStorage`. This is insecure and needs to be replaced with JWT-based server auth.
> 5. Employee accounts are stored in `localStorage`, not in any database.
> 6. The system needs an **online MongoDB database** (like MongoDB Atlas) and proper server deployment to work for multiple users.
> 7. Company statuses in the frontend are: `Deal`, `NoDeal`, `Meeting`, `Called` — the Mongoose model has different values and needs to be updated.
> 8. The `search-companies.html` page is mostly a mockup — its assign feature doesn't actually save anything.
> 9. `employeedashfor.html` is a duplicate and can be ignored or deleted.
