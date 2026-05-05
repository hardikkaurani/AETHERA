# Bug Tracker !

> A production-ready issue tracking and project management platform built on the PERN stack — PostgreSQL, Express.js, React 18, and Node.js — featuring a drag-and-drop Kanban board, role-based access control, collaborative comment threads, and a complete audit trail.

---

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express.js-v4.18%2B-black.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v12%2B-336791.svg)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF.svg)](https://vitejs.dev/)

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Data Flow](#data-flow)
- [Authentication and RBAC Flow](#authentication-and-rbac-flow)
- [Kanban State Machine](#kanban-state-machine)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Security](#security)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Bug Tracker is a full-stack project management application purpose-built for engineering teams that need structured issue tracking without the bloat of enterprise tools. It provides project-scoped ticket management, a drag-and-drop Kanban interface powered by `@hello-pangea/dnd`, collaborative comment threads, and a tamper-evident activity log that captures every state transition.

Key design decisions:

- **PostgreSQL with UUID primary keys**: All entities use `gen_random_uuid()` as their primary key, eliminating sequential ID enumeration attacks and simplifying distributed data merges.
- **CASCADE deletes throughout**: Referential integrity is enforced at the database layer. Deleting a project cascades to members, tickets, comments, and activity logs — no orphaned records.
- **RBAC at the controller layer**: Role validation (Owner, Admin, Manager, Developer, Viewer) is enforced server-side per operation, not at the route level, preventing privilege escalation via direct API calls.
- **Parameterised SQL everywhere**: No query concatenation. All user input passes through parameterised queries, eliminating SQL injection by construction.
- **Vite proxy in development**: The frontend dev server proxies `/api/*` to `localhost:5000`, eliminating CORS complexity during development without changing production configuration.

---

## System Architecture

```mermaid
graph TB
    subgraph Client ["Client Layer - Browser - Vite + React 18"]
        UI[React SPA]
        CTX[AuthContext - Global State]
        HK[Custom Hooks - useAuth, useProjects, useTickets]
        DND[Drag and Drop - hello-pangea/dnd]
        AX[Axios HTTP Client]
        UI --> CTX
        UI --> HK
        UI --> DND
        HK --> AX
        DND --> AX
    end

    subgraph Proxy ["Vite Dev Proxy - Development Only"]
        VP["/api/* forwards to localhost:5000"]
    end

    subgraph API ["API Layer - Express 4.18 / Node.js"]
        GW[Express App - port 5000]
        HELMET[Helmet - Security Headers]
        CORS[CORS Middleware]
        RL[Rate Limiter]
        AUTH[JWT Auth Middleware]
        ERR[Centralised Error Handler]
        GW --> HELMET --> CORS --> RL --> AUTH
        GW --> ERR
    end

    subgraph Controllers ["Controller Layer - Business Logic"]
        AC[Auth Controller]
        PC[Project Controller]
        TC[Ticket Controller]
        CC[Comment Controller]
        ALC[Activity Log Controller]
    end

    subgraph Data ["Data Layer - PostgreSQL 12+"]
        PG[(PostgreSQL)]
        UT[users]
        PR[projects]
        PM[project_members]
        TK[tickets]
        CM[comments]
        AL[activity_logs]
        PG --- UT
        PG --- PR
        PG --- PM
        PG --- TK
        PG --- CM
        PG --- AL
    end

    AX -->|HTTP| VP --> GW
    AUTH --> AC
    AUTH --> PC
    AUTH --> TC
    AUTH --> CC
    AUTH --> ALC
    AC --> PG
    PC --> PG
    TC --> PG
    CC --> PG
    ALC --> PG
```

---

## Database Schema

All six tables use UUID primary keys. Foreign key constraints enforce referential integrity with CASCADE delete semantics, ensuring the database cannot enter an inconsistent state regardless of deletion order at the application layer.

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar name
        timestamp created_at
    }

    projects {
        uuid id PK
        varchar name
        text description
        uuid owner_id FK
        timestamp created_at
        timestamp updated_at
    }

    project_members {
        uuid id PK
        uuid project_id FK
        uuid user_id FK
        varchar role
        timestamp joined_at
    }

    tickets {
        uuid id PK
        uuid project_id FK
        uuid reporter_id FK
        uuid assignee_id FK
        varchar title
        text description
        varchar status
        varchar priority
        varchar type
        timestamp created_at
        timestamp updated_at
    }

    comments {
        uuid id PK
        uuid ticket_id FK
        uuid author_id FK
        text body
        timestamp created_at
    }

    activity_logs {
        uuid id PK
        uuid project_id FK
        uuid ticket_id FK
        uuid actor_id FK
        varchar action
        jsonb meta
        timestamp created_at
    }

    users ||--o{ projects : "owns"
    users ||--o{ project_members : "member of"
    projects ||--o{ project_members : "has members"
    projects ||--o{ tickets : "contains"
    projects ||--o{ activity_logs : "tracks"
    users ||--o{ tickets : "reports"
    users ||--o{ tickets : "assigned to"
    tickets ||--o{ comments : "has"
    tickets ||--o{ activity_logs : "tracked in"
    users ||--o{ comments : "writes"
    users ||--o{ activity_logs : "performs"
```

---

## Data Flow

The following sequence diagram illustrates a complete Kanban drag-and-drop status update — the most complex interaction in the system, involving optimistic UI updates, server-side role validation, database persistence, and activity log emission.

```mermaid
sequenceDiagram
    actor Dev as Developer
    participant Board as Kanban Board React
    participant DND as hello-pangea/dnd
    participant Axios as Axios Client
    participant GW as Express Gateway
    participant Auth as JWT Middleware
    participant TC as Ticket Controller
    participant RBAC as Role Validator
    participant DB as PostgreSQL
    participant AL as Activity Logger

    Dev->>Board: Drags ticket from In Progress to Done
    Board->>DND: onDragEnd event fires
    DND->>Board: Provides source and destination droppableId
    Board->>Board: Optimistic state update - UI updates immediately
    Board->>Axios: PATCH /api/tickets/:id/status with status done

    Axios->>GW: HTTP PATCH with Authorization header
    GW->>Auth: Verify JWT, extract userId
    Auth-->>GW: userId attached to req

    GW->>TC: Handle PATCH /tickets/:id/status
    TC->>DB: SELECT ticket and project membership for userId
    DB-->>TC: Ticket row and member role

    TC->>RBAC: Can role developer update status?
    RBAC-->>TC: Permitted

    TC->>DB: UPDATE tickets SET status = done WHERE id = ticket_id
    DB-->>TC: Updated row

    TC->>AL: Log action STATUS_CHANGED from in_progress to done
    AL->>DB: INSERT INTO activity_logs
    DB-->>AL: Ack

    TC-->>GW: 200 success with updated ticket
    GW-->>Axios: JSON response
    Axios-->>Board: Confirm update
    Board->>Board: Reconcile optimistic state with server response
    Board-->>Dev: Toast notification - Ticket moved to Done
```

---

## Authentication and RBAC Flow

```mermaid
flowchart TD
    A([User Submits Credentials]) --> B{Endpoint}

    B -->|POST /auth/register| C[Hash password with bcryptjs 10 rounds]
    C --> D[INSERT INTO users]
    D --> E[Sign JWT with HS256 and JWT_SECRET]

    B -->|POST /auth/login| F[SELECT user by email]
    F --> G{User found?}
    G -->|No| H[401 Invalid credentials]
    G -->|Yes| I[bcrypt.compare hash]
    I --> J{Match?}
    J -->|No| H
    J -->|Yes| E

    E --> K[Return JWT to client]
    K --> L[Client stores in AuthContext - No localStorage]
    L --> M[Axios attaches Authorization Bearer token]
    M --> N[Auth Middleware verifies signature and expiry]
    N --> O{Valid?}
    O -->|No| P[401 Unauthorized]
    O -->|Yes| Q[Attach userId to req]

    Q --> R{Protected Route Type}
    R -->|Project-scoped| S[Fetch project_members for userId and projectId]
    S --> T{Member exists?}
    T -->|No| U[403 Forbidden]
    T -->|Yes| V[Extract role]
    V --> W{Operation permitted for this role?}
    W -->|No| U
    W -->|Yes| X([Proceed to controller])

    R -->|User-scoped| X
```

### Role Permission Matrix

| Operation | Owner | Admin | Manager | Developer | Viewer |
|---|---|---|---|---|---|
| Delete project | Yes | No | No | No | No |
| Add / remove members | Yes | Yes | No | No | No |
| Create / delete tickets | Yes | Yes | Yes | Yes | No |
| Update ticket status | Yes | Yes | Yes | Yes | No |
| Add comments | Yes | Yes | Yes | Yes | No |
| View all project data | Yes | Yes | Yes | Yes | Yes |

---

## Kanban State Machine

Tickets move through a defined set of statuses. Not all transitions are valid — the backend enforces permitted transitions per role to prevent invalid state jumps.

```mermaid
stateDiagram-v2
    [*] --> open : Ticket created

    open --> in_progress : Developer picks up
    open --> closed : Rejected / duplicate

    in_progress --> in_review : Developer submits PR
    in_progress --> open : Blocked / deprioritised

    in_review --> done : Review approved
    in_review --> in_progress : Changes requested

    done --> closed : Archived
    done --> in_progress : Regression found

    closed --> [*]
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI component library |
| Vite | Latest | Build toolchain and HMR dev server |
| Tailwind CSS | v3 | Utility-first CSS framework |
| @hello-pangea/dnd | Latest | Accessible drag-and-drop |
| Axios | Latest | HTTP client |
| react-hot-toast | Latest | Non-blocking toast notifications |
| React Router | v6+ | Client-side routing |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | v16+ | JavaScript runtime |
| Express | v4.18+ | Web framework |
| PostgreSQL | v12+ | Primary relational datastore |
| pg (node-postgres) | Latest | PostgreSQL client for Node.js |
| JSON Web Token | Latest | Stateless authentication |
| bcryptjs | Latest | Password hashing (10 rounds) |
| Helmet | Latest | HTTP security headers |
| CORS | Latest | Cross-origin request control |

### Tooling and Infrastructure

| Tool | Purpose |
|---|---|
| Vite Proxy | Development API proxy (`/api` → `:5000`) |
| setup.sh | Automated local environment bootstrapping |
| ESLint | Static code analysis |
| Git | Version control |

---

## Project Structure

```
bug-tracker/
|
+-- server/                              # Express REST API
|   +-- config/
|   |   +-- db.js                        # pg Pool configuration + connection test
|   +-- controllers/                     # Business logic (5 controllers)
|   |   +-- auth.controller.js           # Register, login, /me
|   |   +-- project.controller.js        # Project CRUD + member management
|   |   +-- ticket.controller.js         # Ticket CRUD + status transitions
|   |   +-- comment.controller.js        # Comment creation and deletion
|   |   +-- activity.controller.js       # Activity log reads
|   +-- routes/                          # Express Router definitions (5 files)
|   |   +-- auth.routes.js
|   |   +-- project.routes.js
|   |   +-- ticket.routes.js
|   |   +-- comment.routes.js
|   |   +-- activity.routes.js
|   +-- middleware/
|   |   +-- auth.middleware.js           # JWT verification, userId injection
|   |   +-- error.middleware.js          # Centralised error formatting
|   |   +-- rbac.middleware.js           # Role-based access validation
|   +-- sql/
|   |   +-- schema.sql                   # Full DDL — tables, indexes, constraints
|   +-- utils/
|   |   +-- generateToken.js             # JWT sign helper
|   +-- index.js                         # App bootstrap, middleware chain, server start
|   +-- package.json
|   +-- .env.example
|
+-- client/                              # React 18 SPA (Vite)
|   +-- src/
|   |   +-- api/                         # Axios wrapper functions (4 files)
|   |   |   +-- auth.api.js
|   |   |   +-- projects.api.js
|   |   |   +-- tickets.api.js
|   |   |   +-- comments.api.js
|   |   +-- components/                  # UI components (10+ files)
|   |   |   +-- KanbanBoard.jsx          # Drag-and-drop board with DnD context
|   |   |   +-- KanbanColumn.jsx         # Droppable column
|   |   |   +-- TicketCard.jsx           # Draggable ticket card
|   |   |   +-- TicketDetail.jsx         # Full ticket view + comments
|   |   |   +-- ActivityFeed.jsx         # Audit log display
|   |   |   +-- MemberManager.jsx        # Add/remove project members
|   |   |   +-- Navbar.jsx
|   |   |   +-- ProtectedRoute.jsx
|   |   +-- pages/                       # Route-level components (4 pages)
|   |   |   +-- LoginPage.jsx
|   |   |   +-- Dashboard.jsx            # Project list
|   |   |   +-- ProjectPage.jsx          # Kanban + ticket list
|   |   |   +-- TicketPage.jsx           # Ticket detail view
|   |   +-- hooks/                       # Custom React hooks
|   |   |   +-- useAuth.js
|   |   |   +-- useProjects.js
|   |   |   +-- useTickets.js
|   |   +-- context/
|   |   |   +-- AuthContext.jsx          # Global auth state (user, token, login, logout)
|   |   +-- App.jsx                      # React Router route definitions
|   |   +-- main.jsx                     # ReactDOM.createRoot entry point
|   +-- vite.config.js                   # Dev proxy: /api → http://localhost:5000
|   +-- tailwind.config.js
|   +-- package.json
|   +-- .env.example
|
+-- setup.sh                             # One-command local bootstrap
+-- README_DEPLOYMENT.md                 # Production deployment guide
+-- README.md
```

---

## Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| Node.js | v16 | [nodejs.org](https://nodejs.org/) |
| npm | v8 | Bundled with Node.js |
| PostgreSQL | v12 | [postgresql.org](https://www.postgresql.org/download) |
| Git | Any | For cloning |

Verify your environment before proceeding:

```bash
node --version       # Must be v16+
npm --version        # Must be v8+
psql --version       # Must be 12+
```

---

## Environment Configuration

### Server — `server/.env`

```env
# ── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:password@localhost:5432/bug_tracker

# ── Authentication ────────────────────────────────────────────────────────────
# Minimum 64 characters, cryptographically random in production
JWT_SECRET=your-secret-key-here-change-in-production

# ── Server ────────────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:5173
```

### Client — `client/.env`

```env
VITE_API_URL=http://localhost:5000
```

> **Note**: In development, the Vite proxy forwards all `/api/*` requests to `localhost:5000`, so `VITE_API_URL` is primarily used for production builds. Never commit either `.env` file. The `.env.example` files in both directories contain safe placeholder values.

---

## Installation

### Option A — Automated Setup (Recommended)

```bash
cd bug-tracker
bash setup.sh
```

The setup script handles dependency installation, `.env` file creation from templates, database creation, and schema initialisation in one pass.

### Option B — Manual Setup

**Step 1 — Create the database and apply the schema:**

```bash
createdb bug_tracker
psql -d bug_tracker -f server/sql/schema.sql
```

**Step 2 — Install server dependencies:**

```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
npm install
```

**Step 3 — Install client dependencies:**

```bash
cd ../client
cp .env.example .env
npm install
```

---

## Running the Application

**Terminal 1 — Backend API:**

```bash
cd server
npm run dev
# Express listening on http://localhost:5000
```

**Terminal 2 — Frontend Dev Server:**

```bash
cd client
npm run dev
# Vite serving on http://localhost:5173
```

### Application URLs

| Service | URL | Description |
|---|---|---|
| Frontend | http://localhost:5173 | React SPA |
| Backend API | http://localhost:5000 | Express REST API |
| Health Check | http://localhost:5000/api/health | Server + DB connectivity |

---

## API Reference

All routes are prefixed with `/api`. Protected routes require the JWT token issued at login.

```
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create user account |
| `POST` | `/api/auth/login` | No | Authenticate, returns JWT |
| `GET` | `/api/auth/me` | Yes | Get current user profile |

**Register — Request Body:**

```json
{
  "name": "Hardik Kaurani",
  "email": "hardik@example.com",
  "password": "StrongPassword123!"
}
```

**Login — Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-...",
    "name": "Hardik Kaurani",
    "email": "hardik@example.com"
  }
}
```

---

### Projects

| Method | Endpoint | Auth | Min Role | Description |
|---|---|---|---|---|
| `GET` | `/api/projects` | Yes | Member | List all projects for current user |
| `POST` | `/api/projects` | Yes | — | Create new project (caller becomes Owner) |
| `GET` | `/api/projects/:id` | Yes | Member | Get project details |
| `PUT` | `/api/projects/:id` | Yes | Admin | Update project metadata |
| `DELETE` | `/api/projects/:id` | Yes | Owner | Delete project and all related data |
| `POST` | `/api/projects/:id/members` | Yes | Admin | Add member with specified role |

---

### Tickets

| Method | Endpoint | Auth | Min Role | Description |
|---|---|---|---|---|
| `GET` | `/api/projects/:id/tickets` | Yes | Member | List tickets with optional filters |
| `POST` | `/api/projects/:id/tickets` | Yes | Developer | Create new ticket |
| `GET` | `/api/tickets/:id` | Yes | Member | Get ticket detail |
| `PUT` | `/api/tickets/:id` | Yes | Developer | Update ticket fields |
| `PATCH` | `/api/tickets/:id/status` | Yes | Developer | Update ticket status only |
| `DELETE` | `/api/tickets/:id` | Yes | Manager | Delete ticket |

**Ticket Filters (query parameters):**

```
GET /api/projects/:id/tickets?status=in_progress&priority=high&assignee=<uuid>
```

---

### Comments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/tickets/:id/comments` | Yes | Get all comments for a ticket |
| `POST` | `/api/tickets/:id/comments` | Yes | Add comment to ticket |
| `DELETE` | `/api/comments/:id` | Yes | Delete own comment (or Admin+) |

---

### Health Check

```bash
GET /api/health

# Response
{
  "status": "ok",
  "db": "connected",
  "uptime": 3600,
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

### cURL Examples

**Create a ticket:**

```bash
curl -X POST http://localhost:5000/api/projects/<project_id>/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Login button unresponsive on Safari",
    "description": "Reproducible on Safari 17.x. Works on Chrome and Firefox.",
    "priority": "high",
    "type": "bug"
  }'
```

**Update ticket status:**

```bash
curl -X PATCH http://localhost:5000/api/tickets/<ticket_id>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "status": "in_review" }'
```

---

## Security

### Controls in Place

| Control | Implementation |
|---|---|
| Password hashing | bcryptjs, 10 salt rounds |
| Authentication | JWT, HS256, configurable expiry |
| SQL injection prevention | Parameterised queries via `pg` driver throughout |
| HTTP security headers | Helmet (sets `X-Frame-Options`, `HSTS`, `CSP`, etc.) |
| CORS | Strict origin allowlist via `CORS_ORIGIN` env var |
| Role-based access control | Enforced per-operation in controller layer |
| Error sanitisation | Stack traces stripped in `NODE_ENV=production` |

### Security Checklist for Production

Before deploying to a production environment, ensure the following:

- `JWT_SECRET` is at least 64 characters and generated with a cryptographically secure source (e.g. `openssl rand -base64 64`)
- `NODE_ENV` is set to `production`
- PostgreSQL is not exposed on a public network interface
- HTTPS is terminated at the load balancer or reverse proxy (Nginx / Caddy)
- `CORS_ORIGIN` is set to the exact production frontend domain, not a wildcard

---

## Deployment

For step-by-step instructions, see [README_DEPLOYMENT.md](./README_DEPLOYMENT.md).

### Recommended Stack

| Layer | Provider | Notes |
|---|---|---|
| Backend | Render.com or Railway.app | Set all env vars in the dashboard |
| Database | Supabase or Render PostgreSQL | Run `schema.sql` after provisioning |
| Frontend | Vercel or Netlify | Set `VITE_API_URL` to backend URL |

### Essential Deployment Steps

**1. Database** — Create a PostgreSQL instance. Copy the connection string. Run:
```bash
psql <connection_string> -f server/sql/schema.sql
```

**2. Backend** — Push to GitHub. Connect to Render or Railway. Set environment variables. Deploy.

**3. Frontend** — Set `VITE_API_URL` to the production backend URL. Build and deploy:
```bash
cd client && npm run build
# Upload dist/ to Vercel or Netlify
```

---

## Troubleshooting

### Cannot connect to database

```bash
# Verify PostgreSQL is running
pg_isready

# Verify the database exists
psql -l | grep bug_tracker

# Create it if missing
createdb bug_tracker
psql -d bug_tracker -f server/sql/schema.sql
```

Confirm `DATABASE_URL` in `server/.env` matches the format:
```
postgresql://<user>:<password>@<host>:<port>/<dbname>
```

### Frontend shows a blank page

```bash
# Confirm the backend is reachable
curl http://localhost:5000/api/health

# Check the browser console for network errors
# Verify CORS_ORIGIN in server/.env matches the Vite dev server URL exactly
```

### JWT token rejected (401)

- Confirm the token is sent in the `Authorization: Bearer <token>` header format
- Check that `JWT_SECRET` in `server/.env` has not changed since the token was issued
- Tokens expire — re-authenticate to get a fresh token

### Deployment fails on Render / Railway

- Check the build logs on the provider dashboard for the exact error
- Confirm all required environment variables are set in the provider's settings panel
- See [README_DEPLOYMENT.md](./README_DEPLOYMENT.md) for provider-specific notes

---

## FAQ

**How do I reset the database entirely?**

```bash
dropdb bug_tracker
createdb bug_tracker
psql -d bug_tracker -f server/sql/schema.sql
```

**How do I add a new ticket type or priority level?**

Update the `CHECK` constraint in `server/sql/schema.sql` for the relevant column, then apply the change to your database with an `ALTER TABLE` migration. Update the corresponding frontend constants in `client/src/constants/`.

**Can I use a managed PostgreSQL service like Supabase or Neon?**

Yes. Replace `DATABASE_URL` in `server/.env` with the connection string provided by the service. Ensure SSL is enabled for managed services — configure `pg` to use `ssl: { rejectUnauthorized: false }` if required by the provider.

**Can I use SQLite instead of PostgreSQL?**

The schema relies on PostgreSQL-specific features: `gen_random_uuid()`, `UUID` column types, and `JSONB` for activity log metadata. Migrating to SQLite would require replacing these with compatible equivalents and giving up native UUID and JSON indexing. It is not recommended for production use.

**How do I enable HTTPS locally?**

Use a local reverse proxy such as [Caddy](https://caddyserver.com/) or the `local-ssl-proxy` npm package. In production, HTTPS should be terminated at the platform edge (Render, Vercel, Netlify, or Nginx).

---

## Roadmap

Features planned for future iterations:

- Real-time updates via WebSocket (ticket status changes pushed to all collaborators)
- File attachments on tickets (S3 or Supabase Storage)
- Email notifications on ticket assignment and mention
- Advanced filtering and full-text search across tickets
- Custom fields per project
- Milestone and sprint planning
- API key management for CI/CD integrations
- Docker Compose setup for one-command local deployment
- Mobile application (React Native)
- Audit log export (CSV, JSON)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for the full text.

---

## Contact and Support

- **Issues**: [GitHub Issues](https://github.com/hardikkaurani/bug-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hardikkaurani/bug-tracker/discussions)

---

*Built on the PERN stack. April 2026.*
