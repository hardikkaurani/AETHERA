# 🚀 Day 3 — Projects Management

Complete projects system end-to-end for the PERN Bug Tracker!

## ✨ What's Included

### Backend (Seven APIs)
1. ✅ **GET /api/projects** — List all user's projects (paginated)
2. ✅ **POST /api/projects** — Create new project
3. ✅ **GET /api/projects/:id** — Get project details + all members
4. ✅ **PUT /api/projects/:id** — Update project (owner only)
5. ✅ **DELETE /api/projects/:id** — Delete project (owner only)
6. ✅ **POST /api/projects/:id/members** — Add team member (owner/admin only)
7. ✅ **DELETE /api/projects/:id/members/:memberId** — Remove member (owner/admin only)

### Frontend (5 Pages + Components)
1. ✅ **DashboardPage** — Shows all projects in a grid, create project button, delete projects
2. ✅ **ProjectPage** — Single project view, manage members, edit project, delete
3. ✅ **useProjects Hook** — All project state management + loading/error
4. ✅ **CreateProjectModal** — Beautiful form to create new project
5. ✅ **ManageMembersModal** — Add team members by email with role selection
6. ✅ **projects.api.js** — All 7 API calls with error handling

## 🎯 Features Implemented

### Projects Feature
✅ Create projects with title + description  
✅ View all user's projects (paginated)  
✅ View single project details  
✅ Update project info (title, description)  
✅ Delete projects (with confirmation)  
✅ Filter by ownership/membership  

### Team Management
✅ Add members by email  
✅ Assign roles (admin, manager, developer, viewer)  
✅ Remove members  
✅ View all project members with roles  
✅ Role-based access control  

### UI/UX
✅ Beautiful Tailwind design  
✅ Loading states + spinners  
✅ Error handling + toast notifications  
✅ Empty states  
✅ Responsive grid layout  
✅ Role role badges (color-coded)  
✅ Member management modal  

---

## 📁 New Files Created

### Backend
```
server/
├── controllers/
│   └── projects.controller.js ✨ All CRUD + member management
├── routes/
│   └── projects.routes.js ✨ 7 endpoints with auth
```

### Frontend
```
client/src/
├── api/
│   └── projects.api.js ✨ Axios calls for all 7 endpoints
├── hooks/
│   └── useProjects.js ✨ Complete state management
├── pages/
│   ├── DashboardPage.jsx ✨ Projects grid + create button
│   └── ProjectPage.jsx ✨ Single project view + members
├── components/layout/
│   ├── CreateProjectModal.jsx ✨ Create project form
│   └── ManageMembersModal.jsx ✨ Add members form
└── App.jsx ✅ Updated with new routes
```

---

## 🚀 Testing the Projects Feature

### 1. Start Servers (from Day 2 setup)
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit http://localhost:5173

### 2. Register & Login
- Create account
- Login

### 3. Create First Project
- On dashboard, click "+ New Project"
- Enter title (e.g., "Mobile App Redesign")
- Optional: Add description
- Click "Create Project"
- Should appear immediately in grid

### 4. View Project
- Click "Open" on project card
- See project details + members section

### 5. Add Team Members
- Click "+ Add" button in members section
- Enter colleague's email (must be existing user)
- Select role (developer, manager, admin, viewer)
- Click "Add Member"
- Member appears in the list

### 6. Edit Project
- Click "Edit" button
- Modify title/description
- Click "Save"
- Changes appear immediately

### 7. Delete Member
- In project members list, click "Remove" on a member
- Member is removed from project

### 8. Delete Project
- Back to dashboard
- Click "Delete" on project card
- Confirm deletion
- Project removed from grid

---

## 🔐 Authorization Rules

### Project CRUD
- Only **owner** can update/delete projects
- Any **member** can view project details

### Member Management
- Only **owner** or **admin** role can add/remove members
- Cannot remove project owner
- Roles: admin > manager > developer > viewer

### Database Cascades
- Deleting project → deletes all members, tickets, comments

---

## 🗂️ Database Schema (Projects Parts)

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ
);

-- Project members (many-to-many)
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('admin','manager','developer','viewer')),
  joined_at TIMESTAMPTZ,
  PRIMARY KEY (project_id, user_id)
);
```

---

## 📊 API Examples

### Create Project
```bash
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mobile App Redesign",
  "description": "Redesign iOS app UI/UX"
}

Response:
{
  "success": true,
  "data": {
    "project": {
      "id": "abc-123",
      "title": "Mobile App Redesign",
      "owner_id": "user-id",
      ...
    }
  }
}
```

### Get Projects
```bash
GET /api/projects?page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "projects": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "total": 25,
      "limit": 10
    }
  }
}
```

### Add Member
```bash
POST /api/projects/{id}/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "colleague@example.com",
  "role": "developer"
}
```

---

## ✅ Testing Checklist

- [ ] Can create project from dashboard
- [ ] New project appears in grid immediately
- [ ] Can open project and see details
- [ ] Can add team member by email
- [ ] Role dropdown works (admin, manager, developer, viewer)
- [ ] Added member appears in list
- [ ] Can edit project title/description
- [ ] Can delete member from project
- [ ] Can delete project with confirmation
- [ ] Deleted project removed from dashboard
- [ ] Cannot add member if email doesn't exist
- [ ] Role badges show correct colors
- [ ] Loading states appear during operations
- [ ] Error messages show on failures

---

## 🐛 Troubleshooting

### "Failed to add member"
- Verify email exists in users table
- Email must be exact match

### "Access denied" error
- Only owner can edit/delete projects
- Only owner/admin can add/remove members

### Projects not loading
- Check database connection
- Verify auth token in localStorage
- Check browser console for errors

### "Cannot remove owner"
- Owner cannot be removed (by design)
- Transfer ownership first

---

## 🎯 What's Next → Day 4-5: Tickets

After testing projects, next we'll build:
- Tickets CRUD with filters (status, priority, assignee)
- Ticket assignment to team members
- Ticket detail page with comments
- Filtering by project

Just say **"Day 4 tickets"** when ready! 🚀

---

## 💡 Pro Tips

1. **Test with Multiple Users** → Create accounts, add each as project member
2. **Check Logs** → Both backend and frontend console for debugging
3. **Inspect Database** → Use `psql` to verify project/member records
4. **Postman Testing** → Use Postman to test APIs directly with tokens

---

**Day 3 Complete! ✨**
Up next: Tickets system to track bugs and issues!
