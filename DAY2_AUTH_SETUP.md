# 🚀 Day 2 — Authentication Setup

Complete authentication system for the PERN Bug Tracker is now built! 

## ✨ What's Included

### Backend
- ✅ **Database Schema** — Users table with indexes
- ✅ **Auth Controller** — register, login, getMe functions
- ✅ **JWT Middleware** — Token verification for protected routes
- ✅ **Auth Routes** — POST /register, POST /login, GET /me
- ✅ **Token Generator** — JWT creation with configurable expiration
- ✅ **Express Integration** — Routes mounted in server/index.js

### Frontend
- ✅ **AuthContext** — Global auth state management
- ✅ **useAuth Hook** — Easy access to auth context
- ✅ **Login Page** — Beautiful form with validation
- ✅ **Register Page** — Full registration with confirmation
- ✅ **Protected Routes** — Redirects non-authenticated users
- ✅ **Auth API** — Axios calls for all endpoints

---

## 🛠 Setup Instructions

### 1. Create PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb bugtracker

# Create tables from schema
psql -d bugtracker -f server/sql/schema.sql
```

**Option B: Cloud Database (Neon, Supabase, Railway)**
```bash
# Get your DATABASE_URL from the provider dashboard
# Paste it into .env file
# Run schema via your provider's SQL editor or CLI
```

### 2. Configure Environment Variables

Edit `.env` file:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/bugtracker
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
VITE_API_BASE_URL=http://localhost:5000/api
```

⚠️ **Important**: Change `JWT_SECRET` to something unique and secure!

### 3. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 4. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🧪 Test the Authentication

### Register a New User
1. Click "Create Account" on login page
2. Fill in name, email, password
3. Click "Create Account"
4. Should redirect to dashboard

### Login
1. Enter email and password
2. Click "Sign In"
3. Should redirect to dashboard

### JWT Token
- Token is stored in localStorage as `authToken`
- Token is attached to all API requests via Authorization header
- Logout clears the token and redirects to login

---

## 📚 File Structure

```
server/
├── sql/
│   └── schema.sql ✨ Complete database schema
├── controllers/
│   └── auth.controller.js ✨ Register, login, getMe
├── middleware/
│   ├── auth.middleware.js ✨ JWT verification
│   └── error.middleware.js ✅ Error handler
├── routes/
│   └── auth.routes.js ✨ All auth endpoints
├── utils/
│   └── generateToken.js ✨ JWT creation
├── config/
│   └── db.js ✅ PostgreSQL pool
└── index.js ✅ Updated with auth routes

client/
├── src/
│   ├── api/
│   │   └── auth.api.js ✨ Axios API calls
│   ├── context/
│   │   └── AuthContext.jsx ✨ Global auth state
│   ├── hooks/
│   │   └── useAuth.js ✨ Custom hook
│   ├── pages/
│   │   ├── LoginPage.jsx ✨ Login form
│   │   └── RegisterPage.jsx ✨ Register form
│   ├── components/
│   │   └── common/
│   │       └── ProtectedRoute.jsx ✨ Route protection
│   └── App.jsx ✅ Updated with routes & provider
```

---

## 🔐 Authentication Flow

```
1. User fills login/register form
2. Form submitted to /api/auth/login or /api/auth/register
3. Backend validates email and password
4. bcryptjs compares passwords
5. JWT token created and sent to frontend
6. Frontend stores token in localStorage
7. Token attached to all future API requests
8. Frontend redirects to /dashboard
9. Dashboard uses ProtectedRoute to verify auth
If token invalid/expired → redirect to login
```

---

## ✅ Testing Checklist

- [ ] Database connected (check: `npm run dev` shows "Database pool connected")
- [ ] Can register new user
- [ ] Can login with registered email
- [ ] Token stored in localStorage
- [ ] Dashboard accessible after login
- [ ] Logout clears token and redirects
- [ ] Navigating to /dashboard without token redirects to login
- [ ] Password confirmation validation works
- [ ] Error messages display properly

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database exists: `psql -l`

### "JWT_SECRET is undefined"
- Add JWT_SECRET to .env file
- Restart server with `npm run dev`

### "Port 5000 already in use"
- Change PORT in .env or kill process using port 5000

### "CORS error in browser"
- Check CORS_ORIGIN matches frontend URL (http://localhost:5173)
- Restart backend server

### "Login fails with 'Invalid email or password'"
- Verify user exists in database: `SELECT * FROM users;`
- Check password was hashed correctly

---

## 🎯 Next Steps → Day 3: Projects

After testing Auth, next we'll build:
- Projects CRUD (create, read, update, delete)
- Project members (invite team)
- Project dashboard
- Filtering and search

---

## 💡 Pro Tips

1. **Check Network Tab** — Open DevTools to see API requests
2. **Check Database** — Use `psql` to inspect tables
3. **Check Token** — Look at localStorage in DevTools → Application tab
4. **Check Logs** — Both backend and frontend logs show errors

---

## 📖 Documentation Links

- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [JWT Docs](https://jwt.io/)
- [bcryptjs Docs](https://github.com/dcodeIO/bcrypt.js)

---

**Day 2 Complete! ✨**
Ready for Day 3? Just say "Day 3 projects" and we'll build the project management system!
