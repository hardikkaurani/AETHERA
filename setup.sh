#!/bin/bash

# 🚀 Bug Tracker - Quick Deployment Setup Script
# This script helps set up the application for local development and deployment preparation

set -e

echo "╔════════════════════════════════════════╗"
echo "║   🐛 Bug Tracker Setup Script         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "${RED}❌ Node.js is not installed${NC}"
    echo "Please download from https://nodejs.org/"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Please download from https://www.postgresql.org/download/"
    exit 1
fi

echo "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo "${GREEN}✅ PostgreSQL found: $(psql --version)${NC}"
echo ""

# Create directories
echo "${YELLOW}📁 Setting up directory structure...${NC}"
mkdir -p server client

# Backend setup
echo ""
echo "${YELLOW}🔧 Setting up Backend...${NC}"

cd server || exit

if [ ! -f package.json ]; then
    echo "${RED}❌ package.json not found in server directory${NC}"
    exit 1
fi

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Create .env if doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        cat > .env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/bug_tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
EOF
    fi
    echo "${GREEN}✅ .env file created${NC}"
    echo "${YELLOW}⚠️  Please update DATABASE_URL with your PostgreSQL credentials${NC}"
fi

echo "${GREEN}✅ Backend setup complete${NC}"

# Database setup
echo ""
echo "${YELLOW}🗄️  Setting up Database...${NC}"

read -p "Do you want to create the bug_tracker database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Extract database credentials from .env
    DB_USER=${DATABASE_URL%%:*}
    DB_USER=${DB_USER##*//}
    
    echo "Creating database..."
    # Note: This assumes PostgreSQL is running and user has permissions
    createdb bug_tracker 2>/dev/null || echo "${YELLOW}Database might already exist${NC}"
    
    echo "Running schema..."
    psql -U postgres -d bug_tracker -f sql/schema.sql 2>/dev/null && echo "${GREEN}✅ Database schema applied${NC}" || echo "${RED}❌ Failed to apply schema${NC}"
fi

cd ..

# Frontend setup
echo ""
echo "${YELLOW}🎨 Setting up Frontend...${NC}"

cd client || exit

if [ ! -f package.json ]; then
    echo "${RED}❌ package.json not found in client directory${NC}"
    exit 1
fi

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Create .env if doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        echo "VITE_API_URL=http://localhost:5000" > .env
    fi
    echo "${GREEN}✅ .env file created${NC}"
fi

echo "${GREEN}✅ Frontend setup complete${NC}"

cd ..

# Success! Print next steps
echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✅ Setup Complete!                  ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "${GREEN}🚀 Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}Update database credentials in server/.env${NC}"
echo ""
echo "2. ${YELLOW}Start the backend server:${NC}"
echo "   cd server"
echo "   npm run dev"
echo ""
echo "3. ${YELLOW}Start the frontend (in another terminal):${NC}"
echo "   cd client"
echo "   npm run dev"
echo ""
echo "4. ${YELLOW}Open in browser:${NC}"
echo "   http://localhost:5173"
echo ""
echo "📖 For deployment instructions, see README_DEPLOYMENT.md"
echo ""
