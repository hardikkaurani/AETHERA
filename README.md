# 🐛 Bug Tracker — Production-Ready PERN Stack

A complete issue tracking and project management application built with **PostgreSQL, Express.js, React, and Node.js** featuring drag-and-drop Kanban board, team collaboration, and activity tracking.

## ✨ Features (Complete!)

- ✅ **User Authentication** - JWT-based secure login/registration
- ✅ **Project Management** - Create projects, manage teams with roles
- ✅ **Ticket Management** - Create/assign tickets with filtering
- ✅ **Kanban Board** - Drag-and-drop task management with status updates
- ✅ **Comments System** - Collaborative discussions on tickets
- ✅ **Activity Logs** - Complete audit trail of all changes
- ✅ **Role-Based Access** - Owner, Admin, Manager, Developer, Viewer roles
- ✅ **Responsive Design** - Mobile-friendly Tailwind UI
- ✅ **Production Security** - JWT, password hashing, SQL injection prevention

## 🛠 Tech Stack

| Area | Technology | Details |
|------|-----------|---------|
| **Backend** | Express.js 4.18+ | Node.js REST API |
| **Frontend** | React 18 + Vite | Fast bundler, HMR |
| **Database** | PostgreSQL 12+ | UUID keys, CASCADE deletes |
| **Auth** | JWT + bcryptjs | Secure tokens + password hashing |
| **Styling** | Tailwind CSS v3 | Responsive design |
| **Drag & Drop** | @hello-pangea/dnd | Smooth interactions |
| **HTTP** | axios | Client requests |
| **Notifications** | react-hot-toast | Toast alerts |

## 📦 Project Structure

```
bug-tracker/
├── server/
│   ├── config/db.js                 # PostgreSQL connection
│   ├── controllers/                 # Business logic (5 controllers)
│   ├── routes/                      # API routes (5 route files)
│   ├── middleware/                  # Auth & error handling
│   ├── sql/schema.sql               # Database schema
│   ├── utils/generateToken.js       # JWT utilities
│   ├── index.js                     # Express app
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── api/                     # API call functions (4 files)
│   │   ├── components/              # React components (10+ files)
│   │   ├── pages/                   # Route pages (4 pages)
│   │   ├── hooks/                   # Custom hooks (useAuth, useProjects, useTickets)
│   │   ├── context/                 # Global state (AuthContext)
│   │   ├── App.jsx                  # Router setup
│   │   └── main.jsx
│   ├── vite.config.js               # Proxy to localhost:5000
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
│
├── setup.sh                         # Quick setup script
├── README_DEPLOYMENT.md             # Complete deployment guide
└── README.md                        # This file
```

## 🚀 Quick Start (5 minutes)

### Prerequisites
- **Node.js** 16+ ([Download](https://nodejs.org))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download))
- **npm** or **yarn**

### Option 1: Automated Setup (Recommended)
```bash
# Go to project directory
cd bug-tracker

# Run setup script (Unix/Mac/Linux)
bash setup.sh

# Or on Windows:
# 1. cd server && npm install
# 2. cd ../client && npm install  
# 3. Update .env files manually
```

### Option 2: Manual Setup
```bash
# Backend
cd server
npm install
# Create .env file with DATABASE_URL, JWT_SECRET, etc.
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

Visit: **http://localhost:5173**

## 📝 Environment Variables

### Server (server/.env)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/bug_tracker
JWT_SECRET=your-secret-key-here-change-in-production
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Client (client/.env)
```env
VITE_API_URL=http://localhost:5000
```

See `.env.example` files for templates.

## 🎯 API Endpoints

**Server** (terminal 1):
```bash
cd server
npm run dev
```

**Client** (terminal 2):
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📚 API Documentation

### Authentication Routes
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Get current user (protected)

### Project Routes
- `GET /api/projects` — List user's projects
- `POST /api/projects` — Create new project
- `GET /api/projects/:id` — Get project details
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project
- `POST /api/projects/:id/members` — Add project member

### Ticket Routes
- `GET /api/projects/:id/tickets` — List tickets (with filters)
- `POST /api/projects/:id/tickets` — Create ticket
- `GET /api/tickets/:id` — Get ticket details
- `PUT /api/tickets/:id` — Update ticket
- `PATCH /api/tickets/:id/status` — Update ticket status
- `DELETE /api/tickets/:id` — Delete ticket

### Comment Routes
- `GET /api/tickets/:id/comments` — Get ticket comments
- `POST /api/tickets/:id/comments` — Add comment
- `DELETE /api/comments/:id` — Delete comment

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Helmet security headers
- Parameterized SQL queries (no injection)
- Role-based access control
- Environment variable configuration

## 📝 Development Workflow

### Days 1-2: Core Setup
- ✅ Project scaffolding
- ✅ Database configuration
- ✅ Authentication system

### Days 3-5: Projects & Tickets
- Project CRUD operations
- Ticket management
- Filtering & sorting

### Days 6-8: UI & Kanban
- Dashboard & project views
- Kanban board with drag-and-drop
- Ticket detail page

### Days 9-12: Polish & Deployment
- Comments system
- Real-time updates
- Deployment (Render + Vercel)

## 🚢 Deployment

### Quick Deployment Guide
See **[README_DEPLOYMENT.md](./README_DEPLOYMENT.md)** for complete step-by-step deployment instructions.

### Recommended Stack
- **Backend**: Render.com or Railway.app
- **Frontend**: Vercel or Netlify  
- **Database**: Supabase or Render PostgreSQL

### Essential Deployment Steps
1. **Backend**: Push to GitHub → Connect to Render/Railway → Set environment variables
2. **Database**: Create PostgreSQL instance → Run schema → Get connection string
3. **Frontend**: Build → Connect to Vercel/Netlify → Set API URL
4. **API Endpoint**: Update `REACT_APP_API_URL` in frontend to production backend

For detailed instructions: **[See Deployment Guide →](./README_DEPLOYMENT.md)**

## 📊 Database Schema

**6 tables** with full ACID compliance:
- `users` - User accounts
- `projects` - Projects with owners
- `project_members` - Team membership & roles
- `tickets` - Issues/tasks
- `comments` - Discussion threads
- `activity_logs` - Audit trail

All tables use UUID primary keys with CASCADE deletes.

## 🔒 Security Checklist

✅ JWT tokens with expiration
✅ bcryptjs password hashing (10 rounds)
✅ Parameterized SQL (no injection)
✅ CORS configured by origin
✅ Helmet security headers
✅ Role-based access control
✅ Error handling (no data leaks)
✅ HTTPS recommended for production

## 🤔 FAQ

**Q: How do I reset the database?**
```bash
dropdb bug_tracker
createdb bug_tracker
psql -d bug_tracker -f server/sql/schema.sql
```

**Q: How do I add a new user role?**
A: Update the role CHECK constraint in `server/sql/schema.sql` and add to role validation in controllers.

**Q: Can I use SQLite instead?**
A: PostgreSQL-specific features are used (UUIDs, CASCADE). Modify schema for SQLite compatibility.

**Q: How do I enable HTTPS?**
A: Use a reverse proxy (nginx) or cloud provider's SSL certificates (included on Render/Vercel).

## 🆘 Troubleshooting

### Common Issues

**"Cannot connect to database"**
- Verify PostgeSQL is running: `psql --version`
- Check DATABASE_URL format
- Ensure database exists: `createdb bug_tracker`

**"Frontend blank page"**
- Check browser console for errors
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check CORS settings in `server/index.js`

**"Deploy fails"**
- See [README_DEPLOYMENT.md](./README_DEPLOYMENT.md#troubleshooting) for deployment troubleshooting
- Check logs on Render/Railway/Vercel dashboard

## 📚 Additional Resources

- **[Full Deployment Guide](./README_DEPLOYMENT.md)** - Step-by-step deployment
- **Express.js Docs**: https://expressjs.com
- **React Docs**: https://react.dev
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **JWT**: https://jwt.io

## 🎉 Status: Production Ready!

- ✅ All core features implemented
- ✅ Security best practices applied
- ✅ Responsive UI complete
- ✅ Error handling comprehensive
- ✅ Database optimized
- ✅ Ready for deployment

## 📄 License

MIT License - Open source for commercial and personal use

---

**Built with ❤️ using PERN Stack**  
*April 2026*
