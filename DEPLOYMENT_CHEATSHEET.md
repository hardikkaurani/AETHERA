#!/bin/bash

# 🚀 BUG TRACKER - DEPLOYMENT CHEAT SHEET
# Quick reference for local development and deployment commands

# ============================================
# LOCAL DEVELOPMENT
# ============================================

# Setup (first time)
bash setup.sh

# Start Backend (Terminal 1)
cd server
npm install          # First time only
npm run dev         # Starts on http://localhost:5000

# Start Frontend (Terminal 2)
cd client
npm install          # First time only
npm run dev         # Starts on http://localhost:5173

# Build for Production
cd client
npm run build       # Creates dist/ folder

# Check server health
curl http://localhost:5000/api/health

# ============================================
# DATABASE
# ============================================

# Create database
createdb bug_tracker

# Drop database (WARNING: deletes all data)
dropdb bug_tracker

# Run schema
psql -d bug_tracker -f server/sql/schema.sql

# Connect to database
psql -d bug_tracker

# List tables
\dt

# Quit psql
\q

# ============================================
# ENVIRONMENT VARIABLES
# ============================================

# Server .env example
cat > server/.env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/bug_tracker
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
EOF

# Client .env example
cat > client/.env << EOF
VITE_API_URL=http://localhost:5000
EOF

# ============================================
# GIT COMMANDS
# ============================================

# Initialize repo
git init
git add .
git commit -m "Initial commit: Bug Tracker PERN Stack"

# Push to GitHub
git remote add origin https://github.com/username/bug-tracker.git
git branch -M main
git push -u origin main

# ============================================
# DEPLOYMENT - BACKEND (RENDER)
# ============================================

# 1. Create Render account at https://render.com
# 2. New → Web Service
# 3. Connect GitHub repo
# 4. Build Command:
#    npm install
# 5. Start Command:
#    npm start
# 6. Environment variables:
#    DATABASE_URL=postgresql://...
#    JWT_SECRET=your-secret
#    NODE_ENV=production
#    CORS_ORIGIN=https://your-frontend.vercel.app

# ============================================
# DEPLOYMENT - DATABASE (SUPABASE)
# ============================================

# 1. Create account at https://supabase.com
# 2. Create new project
# 3. Go to SQL Editor
# 4. Run schema:
#    - Open server/sql/schema.sql
#    - Copy all content
#    - Paste in Supabase SQL editor
#    - Execute
# 5. Copy connection string to backend ENV

# ============================================
# DEPLOYMENT - FRONTEND (VERCEL)
# ============================================

# 1. Go to https://vercel.com
# 2. Import GitHub repo
# 3. Select client folder as root
# 4. Environment variables:
#    VITE_API_URL=https://your-backend.onrender.com
# 5. Deploy!

# ============================================
# MONITORING & LOGS
# ============================================

# View Render logs (in browser)
# https://dashboard.render.com → Select service → Logs

# Vercel deployment logs
# https://vercel.com → Select project → Deployments

# Check production health
curl https://your-backend.onrender.com/api/health

# ============================================
# USEFUL LINKS
# ============================================

# GitHub: https://github.com/
# Render: https://render.com
# Vercel: https://vercel.com
# Supabase: https://supabase.com
# PostgreSQL: https://postgresql.org
# Express Docs: https://expressjs.com
# React Docs: https://react.dev

# ============================================
# npm COMMANDS
# ============================================

# Install all dependencies
npm install

# Install specific package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Update all packages
npm update

# List installed packages
npm list

# Remove package
npm uninstall package-name

# Clear npm cache
npm cache clean --force

# ============================================
# POSTGRESQL COMMANDS
# ============================================

# List databases
\l

# List tables
\dt

# Describe table
\d table_name

# Query users
SELECT * FROM users;

# Update user
UPDATE users SET name='John' WHERE id='uuid-here';

# Delete user
DELETE FROM users WHERE id='uuid-here';

# Get count
SELECT COUNT(*) FROM tickets;

# Backup database
pg_dump -U postgres bug_tracker > backup.sql

# Restore database
psql -U postgres -d bug_tracker < backup.sql

# ============================================
# DEBUGGING
# ============================================

# Backend logs (check development terminal)
# Frontend logs (open browser DevTools → Console)

# Check API response
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test database connection
node -e "
const pool = require('./server/config/db.js').default;
pool.query('SELECT NOW()', (err, res) => {
  console.log(err || res.rows);
  process.exit(0);
});
"

# ============================================
# PRODUCTION CHECKLIST
# ============================================

# [ ] All tests pass
# [ ] Environment variables set
# [ ] Database migrations run
# [ ] Build succeeds (npm run build)
# [ ] Health check passes
# [ ] Registration works
# [ ] Login works
# [ ] Projects CRUD works
# [ ] Tickets creation works
# [ ] Kanban drag-and-drop works
# [ ] Comments work
# [ ] Activity log works
# [ ] Errors handled gracefully
# [ ] No console errors
# [ ] API CORS working
# [ ] SSL certificate installed
# [ ] Rate limiting enabled (optional)
# [ ] Monitoring configured

# ============================================
# QUICK DEPLOYMENT SUMMARY
# ============================================

# 1. Push code to GitHub
#    git add . && git commit -m "..." && git push

# 2. Deploy backend to Render
#    - Connect GitHub repo
#    - Add environment variables
#    - Deploy

# 3. Deploy database to Supabase
#    - Create project
#    - Run schema
#    - Copy connection string

# 4. Deploy frontend to Vercel
#    - Connect GitHub repo
#    - Add environment variables (VITE_API_URL)
#    - Deploy

# 5. Test production
#    - Visit frontend URL
#    - Register/login
#    - Create project
#    - Create ticket
#    - Test Kanban

# 🎉 DONE!
