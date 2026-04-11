# 🚀 Bug Tracker - Complete Deployment Guide

## Phase 1: Local Database Setup (5 mins)

### Option A: PostgreSQL Locally

```bash
# Windows (using PostgreSQL installer)
# 1. Download: https://www.postgresql.org/download/windows/
# 2. Install with default settings
# 3. Remember the password you set

# Create database
psql -U postgres
CREATE DATABASE bug_tracker;
\c bug_tracker

# Run schema
\i server/sql/schema.sql
\dt  # Verify tables created

# Exit
\q
```

### Option B: Docker (Recommended for Quick Setup)

```bash
# Run PostgreSQL in Docker
docker run --name bug-tracker-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bug_tracker \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps

# Connect and load schema
docker exec -i bug-tracker-db psql -U postgres -d bug_tracker < server/sql/schema.sql
```

---

## Phase 2: Environment Setup (3 mins)

### Backend (.env Configuration)

Create `server/.env` file:

```env
# Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bug_tracker

# JWT Token (Generate: openssl rand -base64 32)
JWT_SECRET=your-secure-random-string-here-min-32-chars

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env Configuration)

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

---

## Phase 3: Local Development Test (5 mins)

### Terminal 1: Start Backend

```bash
cd server
npm install
npm run dev
# Should show: ✓ Server running on http://localhost:5000
# ✓ Database pool connected
```

### Terminal 2: Start Frontend

```bash
cd client
npm install
npm run dev
# Should show: ✓ Local: http://localhost:5173
```

### Test the App

1. Open http://localhost:5173
2. Register new account
3. Create a project
4. Add tickets
5. Test Kanban drag-and-drop

---

## Phase 4: Production Deployment (Choose One)

### Option 1: Deploy on Render (Easiest) ⭐

#### Backend Deployment

1. **Push code to GitHub** ✅ (Already done!)

2. **Create Render Account:**
   - Go to https://render.com
   - Sign up with GitHub

3. **Deploy Backend:**
   - Click "New" → "Web Service"
   - Connect GitHub repo
   - Settings:
     ```
     Name: bug-tracker-api
     Root Directory: server
     Build Command: npm install
     Start Command: npm start
     ```
   - Add Environment Variables:
     ```
     DATABASE_URL=postgresql://user:password@host:port/dbname
     JWT_SECRET=your-prod-secret-key
     NODE_ENV=production
     CORS_ORIGIN=https://your-frontend-url.onrender.com
     PORT=10000
     ```
   - Deploy!

4. **Create PostgreSQL Database:**
   - On Render Dashboard → "New" → "PostgreSQL"
   - Name: bug-tracker-db
   - Region: Same as backend
   - Plan: Free (for testing)
   - Copy PostgreSQL connection string to `DATABASE_URL`
   - Connect and run schema:
     ```bash
     psql <DATABASE_URL> -f server/sql/schema.sql
     ```

#### Frontend Deployment

1. **Build Frontend:**
   ```bash
   cd client
   npm run build
   # Creates dist/ folder
   ```

2. **Deploy on Render:**
   - Click "New" → "Static Site"
   - Connect GitHub repo
   - Build Command: `npm install && npm run build`
   - Publish Directory: `client/dist`
   - Environment Variable:
     ```
     VITE_API_URL=https://bug-tracker-api.onrender.com
     ```
   - Deploy!

---

### Option 2: Deploy on Railway (Fast Alternative)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd bug-tracker
railway init

# Create services
railway add --service postgres
railway add --service nodejs

# Deploy
railway up

# Get URLs (for CORS configuration)
railway open
```

---

### Option 3: Deploy on Vercel + Heroku

**Frontend (Vercel):**
```bash
npm i -g vercel
vercel login
cd client && vercel
```

**Backend (Heroku):**
```bash
# Install Heroku CLI first
heroku login
cd server
heroku create bug-tracker-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

---

## Phase 5: Database Migration (Important!) 🔑

### After deploying backend, run schema on production database:

```bash
# Using psql directly
psql <PRODUCTION_DATABASE_URL> < server/sql/schema.sql

# Or using Docker
docker exec -i <container_name> psql \
  -U <postgres_user> \
  -d <database_name> \
  < server/sql/schema.sql

# Verify tables
\dt
```

---

## Phase 6: Final Configuration & Testing

### Update Frontend API URL

If using cloud deployment, update:
- `client/.env.production` with production backend URL
- Or set `VITE_API_URL` environment variable during build

### Test Production Endpoints

```bash
# Test backend health
curl https://your-api-url/health

# Test database connection
# Should be able to register/login on frontend
```

### Enable HTTPS

- Most platforms (Render, Railway, Vercel) auto-enable HTTPS
- Update JWT_SECRET to production-grade random string:
  ```bash
  openssl rand -base64 32
  ```

---

## 🎯 Deployment Checklist

```
Phase 1: Database ✅
□ PostgreSQL installed/running
□ bug_tracker database created
□ schema.sql executed

Phase 2: Environment ✅
□ server/.env created with DATABASE_URL
□ JWT_SECRET set (32+ chars)
□ client/.env created with API URL

Phase 3: Local Testing ✅
□ npm install (both server & client)
□ npm run dev on both
□ Can register/login/create projects
□ Kanban drag-and-drop works

Phase 4: Production ✅
□ Backend deployed to Render/Railway/Heroku
□ Frontend deployed to Vercel/Render/Netlify
□ Database migrated to production
□ CORS_ORIGIN updated to frontend URL

Phase 5: Post-Deploy ✅
□ Test login/registration
□ Test CRUD operations
□ Test Kanban board
□ Check browser console for errors
□ Check server logs for errors
□ Monitor database connections

Phase 6: Maintenance ✅
□ Set up monitoring/alerts
□ Enable database backups
□ Document API endpoints
□ Plan scaling strategy
```

---

## 🆘 Troubleshooting

### "Database connection refused"
```bash
# Check PostgreSQL running
pg_isready -h localhost -p 5432

# Check DATABASE_URL format
postgresql://user:password@host:port/dbname
```

### "CORS errors"
- Update `CORS_ORIGIN` in backend .env to match frontend URL
- Restart backend after changing

### "Tables don't exist"
- Verify schema.sql was executed
- Re-run: `psql -U postgres -d bug_tracker -f server/sql/schema.sql`

### "JWT token invalid"
- Ensure JWT_SECRET is same on frontend & backend
- Check token expiry (7 days set to 24 hours in dev if testing)

### "Build fails on Render/Railway"
- Push latest code: `git push origin main`
- Ensure package.json has all dependencies
- Check `npm run build` works locally first

---

## 📊 Production Recommendations

1. **Database Backups:** Enable automated backups on Render/Railway
2. **Monitoring:** Use Sentry for error tracking
3. **CDN:** Use Cloudflare for frontend optimization
4. **SSL:** Already handled by platforms
5. **Rate Limiting:** Already implemented in code ✅
6. **HTTPS:** Enforce in backend CORS config

---

## 🔒 Security Checklist

- ✅ Password validation (8+ chars, special chars)
- ✅ JWT tokens with expiry (7 days)
- ✅ bcryptjs password hashing (12 salt rounds)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (HTML escaping)
- ✅ Rate limiting (5 req/15 min)
- ✅ CORS configured
- ✅ SSL/TLS enabled (production)
- ✅ Environment variables secured

---

## 📞 Quick Support

**Github Issues:** https://github.com/hardikkaurani/AETHERA/issues
**Documentation:** See README.md for feature details

---

**Status:** Ready for Production Deployment 🚀
**Last Updated:** April 2026
