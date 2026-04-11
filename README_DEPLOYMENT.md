# 🐛 Bug Tracker - Complete PERN Stack Application

A production-grade bug tracking and project management application built with **PostgreSQL, Express, React, Node.js** with drag-and-drop Kanban board, comments system, and activity logging.

## ✨ Features

### 🔐 Authentication
- User registration with email/password
- Secure login with JWT tokens (7-day expiration)
- Password hashing with bcryptjs
- Protected routes and middleware

### 📁 Projects Management
- Create, read, update, delete projects
- Team member management with role-based access
- 4 role types: Owner, Admin, Manager, Developer, Viewer
- Project-level permissions

### 🎫 Tickets Management
- Create tickets with title, description, type, priority
- 3 statuses: To Do, In Progress, Done
- 4 priorities: Low, Medium, High, Critical
- 4 types: Bug, Feature, Task, Improvement
- Ticket assignment to team members
- Due dates and creation tracking
- Advanced filtering: by status, priority, assignee, search term
- Pagination support

### 💬 Comments System
- Add comments to tickets
- Delete comments (author/admin only)
- Comment count tracking
- Timestamp tracking

### 📊 Kanban Board
- 3-column drag-and-drop board (Todo, In Progress, Done)
- Drag-and-drop powered by `@hello-pangea/dnd`
- Real-time status updates
- Priority color indicators
- List view alternative

### 📝 Activity Logging
- Track all project activities
- Log ticket creation/updates/deletion
- Log status changes and comments
- User-level and project-level activity logs
- Detailed activity timeline

### 🎨 User Interface
- Responsive Tailwind CSS design
- Dark-mode friendly colors
- Toast notifications (react-hot-toast)
- Loading spinners and error handling
- Modal forms for creating/editing
- Color-coded badges for priority/status

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- PostgreSQL 12+
- Git

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone <repo-url>
cd bug-tracker
```

#### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/bug_tracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
EOF

# Create PostgreSQL database
createdb bug_tracker

# Run schema to set up tables
psql -U postgres -d bug_tracker -f sql/schema.sql

# Start server
npm run dev
```

Server runs at: `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env file (optional, proxy configured in vite.config.js)
cat > .env << EOF
VITE_API_URL=http://localhost:5000
EOF

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

#### 4. Test the Application
1. Register a new account
2. Create a project
3. Add team members
4. Create tickets
5. Try Kanban board drag-and-drop
6. Add comments to tickets

---

## 📋 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register      - Register new user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user (protected)
```

### Projects Endpoints
```
GET    /api/projects                - Get all user projects
POST   /api/projects                - Create new project
GET    /api/projects/:id            - Get project details
PUT    /api/projects/:id            - Update project
DELETE /api/projects/:id            - Delete project
POST   /api/projects/:id/members    - Add team member
DELETE /api/projects/:id/members    - Remove team member
```

### Tickets Endpoints
```
GET    /api/projects/:id/tickets                    - List tickets (with filters)
POST   /api/projects/:id/tickets                    - Create ticket
GET    /api/tickets/:id                             - Get ticket details
PUT    /api/tickets/:id                             - Update ticket
PATCH  /api/tickets/:id/status                      - Update ticket status
DELETE /api/tickets/:id                             - Delete ticket
```

### Comments Endpoints
```
GET    /api/tickets/:id/comments     - List comments
POST   /api/tickets/:id/comments     - Create comment
DELETE /api/comments/:id             - Delete comment
```

### Activity Endpoints
```
GET    /api/projects/:projectId/activity   - Get project activity log
GET    /api/activity                       - Get user activity log
```

---

## 🔧 Environment Variables

### Server (.env)
```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Client (.env)
```
VITE_API_URL=https://your-api-domain.com
```

---

## 📦 Deployment

### Backend Deployment (Render or Railway)

#### Option 1: Deploy to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) and sign in
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Build Command**: `npm install && npm run build` (if needed)
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. Add environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Your secret key
   - `CORS_ORIGIN`: Frontend URL
   - `NODE_ENV`: production
7. Deploy!

#### Option 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project" → "Deploy from GitHub"
3. Select your repository
4. Configure:
   - **Start Command**: `npm start`
5. Add environment variables in Railway dashboard
6. Deploy!

### Database Deployment

#### PostgreSQL on Render
1. In Render dashboard: New → PostgreSQL
2. Name: bug-tracker
3. Copy connection string to server `.env` as `DATABASE_URL`
4. Run schema: `psql $DATABASE_URL < sql/schema.sql`

#### Or use Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Run schema in SQL editor
3. Copy connection string to `.env`

### Frontend Deployment (Vercel or Netlify)

#### Option 1: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. In `client` directory: `vercel`
3. Configure environment:
   - `VITE_API_URL`: Your deployed backend URL
4. Vercel automatically detects Vite and deploys!

#### Option 2: Deploy to Netlify

1. Build project: `npm run build`
2. Deploy `dist` folder to [netlify.com](https://netlify.com)
3. Configure environment variables
4. Add redirect rules in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🗄️ Database Schema

### Tables
- **users** - User accounts with hashed passwords
- **projects** - Project documents with owner
- **project_members** - Many-to-many with role-based access
- **tickets** - Issues/tasks with status and priority
- **comments** - Comments on tickets with author tracking
- **activity_logs** - Audit trail of all project activities

All tables use UUID primary keys with CASCADE deletes for data integrity.

---

## 🔒 Security Features

✅ **JWT Authentication** - Secure token-based auth
✅ **Password Hashing** - bcryptjs with 10 salt rounds
✅ **SQL Injection Prevention** - Parameterized queries
✅ **CORS Protection** - Configurable origin
✅ **Helmet.js** - HTTP security headers
✅ **Role-Based Access Control** - Permission checks on all routes
✅ **Rate Limiting** - Can be added with middleware
✅ **HTTPS** - Recommended for production

---

## 📊 Project Structure

```
bug-tracker/
├── server/
│   ├── config/
│   │   └── db.js              # PostgreSQL connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── projects.controller.js
│   │   ├── tickets.controller.js
│   │   ├── comments.controller.js
│   │   └── activity.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── projects.routes.js
│   │   ├── tickets.routes.js
│   │   ├── comments.routes.js
│   │   └── activity.routes.js
│   ├── sql/
│   │   └── schema.sql         # Database schema
│   ├── index.js               # Express app entry
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/               # API call functions
│   │   ├── context/           # React Context (Auth)
│   │   ├── hooks/             # Custom hooks (useTickets, useProjects)
│   │   ├── pages/             # Route pages
│   │   ├── components/        # React components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js         # Vite config with API proxy
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `vite.config.js` proxy setting
- Verify `CORS_ORIGIN` in server `.env`
- Ensure backend is running on port 5000

### Database connection fails
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Run: `psql $DATABASE_URL` to test connection

### Tickets not loading
- Check user is project member
- Verify JWT token is valid
- Check browser developer tools Network tab

### Kanban drag-and-drop not working
- Clear browser cache
- Check if `@hello-pangea/dnd` is installed
- Verify JavaScript console for errors

---

## 📚 Dependencies

### Backend
- express (API framework)
- pg (PostgreSQL)
- bcryptjs (Password hashing)
- jsonwebtoken (JWT)
- helmet (Security headers)
- cors (Cross-origin requests)
- dotenv (Environment variables)

### Frontend
- react (UI library)
- vite (Build tool)
- tailwind-css (Styling)
- axios (HTTP client)
- react-router-dom (Routing)
- react-hot-toast (Notifications)
- @hello-pangea/dnd (Drag-and-drop)

---

## 📈 Future Enhancements

- [ ] Real-time updates with Socket.io
- [ ] File attachments with Multer
- [ ] Advanced filtering and saved views
- [ ] Custom fields on tickets
- [ ] Email notifications
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)
- [ ] Integration with GitHub/GitLab
- [ ] API rate limiting
- [ ] Multi-language support

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📞 Support

For issues or questions:
- Open GitHub Issue
- Email: support@bugtrackerapp.com
- Documentation: https://docs.bugtrackerapp.com

---

**Built with ❤️ using PERN Stack**
