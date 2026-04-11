# ✅ Bug Tracker - Complete Testing Checklist

**Date:** April 11, 2026  
**Version:** 1.0.1  
**Status:** Ready for QA

---

## 🔐 Security Tests

### Password Validation ✓

- [ ] **Test 1: Too Short**
  - Input: "Pass1!"
  - Expected: Error "Password must be at least 8 characters long"
  - Status: ___

- [ ] **Test 2: No Number**
  - Input: "Password!"
  - Expected: Error "Password must contain at least one number"
  - Status: ___

- [ ] **Test 3: No Special Character**
  - Input: "Password123"
  - Expected: Error "Password must contain at least one special character"
  - Status: ___

- [ ] **Test 4: Valid Password**
  - Input: "SecurePass1@"
  - Expected: Success, user created
  - Status: ___

---

### Email Validation ✓

- [ ] **Test 1: Invalid Format**
  - Input: "notanemail"
  - Expected: Error "Please enter a valid email address"
  - Status: ___

- [ ] **Test 2: Missing Domain**
  - Input: "user@"
  - Expected: Error "Please enter a valid email address"
  - Status: ___

- [ ] **Test 3: Valid Email**
  - Input: "user@example.com"
  - Expected: Success
  - Status: ___

- [ ] **Test 4: Case Insensitive**
  - Register: "User@Example.Com"
  - Login: "user@example.com"
  - Expected: Same account recognized
  - Status: ___

---

### Rate Limiting ✓

- [ ] **Test 1: Normal Requests**
  - Make 5 login attempts with wrong password
  - Expected: All 5 get proper error responses
  - Status: ___

- [ ] **Test 2: Rate Limit Trigger**
  - Make 6th login attempt within 15 minutes
  - Expected: Response 429, "Too many requests"
  - Status: ___

- [ ] **Test 3: Rate Limit Reset**
  - Wait 15 minutes or use different IP
  - Expected: Can login again
  - Status: ___

---

### XSS Protection ✓

- [ ] **Test 1: Script Tag in Comment**
  - Add comment: `<script>alert('XSS')</script>`
  - Expected: Displays as text, no alert
  - Status: ___

- [ ] **Test 2: Event Handler**
  - Add comment: `<img src=x onerror="alert('XSS')">`
  - Expected: Displays as text, no alert
  - Status: ___

- [ ] **Test 3: HTML Entities Display**
  - Inspect DOM of comment
  - Expected: Script tags escaped as `&lt;script&gt;`
  - Status: ___

---

### SSL Configuration ✓

- [ ] **Test 1: Production Environment**
  - Set NODE_ENV=production
  - Check db.js configuration
  - Expected: `rejectUnauthorized: true`
  - Status: ___

- [ ] **Test 2: Database Connection**
  - Connect with production settings
  - Expected: No SSL errors, secure connection
  - Status: ___

---

## 🎯 Functional Tests

### Registration Flow ✓

- [ ] **Test 1: Happy Path**
  - Fill all fields with valid data
  - Expected: User created, redirected to dashboard
  - Status: ___

- [ ] **Test 2: Duplicate Email**
  - Register with existing email
  - Expected: Error "Email already registered"
  - Status: ___

- [ ] **Test 3: Password Mismatch**
  - Password: "SecurePass1@"
  - Confirm: "SecurePass2@"
  - Expected: Error "Passwords do not match"
  - Status: ___

- [ ] **Test 4: Required Fields**
  - Leave name/email/password empty
  - Expected: Error "All fields are required"
  - Status: ___

---

### Login Flow ✓

- [ ] **Test 1: Valid Credentials**
  - Use registered account
  - Expected: Login success, token saved, redirected to dashboard
  - Status: ___

- [ ] **Test 2: Invalid Password**
  - Correct email, wrong password
  - Expected: Error "Invalid email or password"
  - Status: ___

- [ ] **Test 3: Non-existent Email**
  - Email not in database
  - Expected: Error "Invalid email or password"
  - Status: ___

- [ ] **Test 4: Rate Limit**
  - 6 failed attempts in 15 min
  - Expected: 429 error on 6th attempt
  - Status: ___

---

### Token Management ✓

- [ ] **Test 1: Token Storage**
  - Login successfully
  - Check localStorage for 'authToken'
  - Expected: JWT token stored
  - Status: ___

- [ ] **Test 2: Token on Requests**
  - Open DevTools Network tab
  - Make API request
  - Expected: Authorization header has "Bearer <token>"
  - Status: ___

- [ ] **Test 3: Token Expiry Setup**
  - After login, check token in browser console
  - Decode JWT (use jwt.io)
  - Expected: Expiry time is ~7 days from now
  - Status: ___

- [ ] **Test 4: Expired Token Logout** (Optional)
  - Create token with 1-minute expiry (for testing)
  - Wait for auto-logout
  - Expected: Automatically logged out, redirected to login
  - Status: ___

---

### Project Management ✓

- [ ] **Test 1: Create Project**
  - Dashboard → New Project
  - Fill title and description
  - Expected: Project appears in list
  - Status: ___

- [ ] **Test 2: View Project**
  - Click on project
  - Expected: See project details and team
  - Status: ___

- [ ] **Test 3: Update Project**
  - Edit project title
  - Expected: Changes saved and displayed
  - Status: ___

- [ ] **Test 4: Delete Project**
  - Click delete, confirm
  - Expected: Project removed from list
  - Status: ___

- [ ] **Test 5: Add Member**
  - Project → Add Member
  - Enter team member email and role
  - Expected: Member added to project
  - Status: ___

---

### Ticket Management ✓

- [ ] **Test 1: Create Ticket**
  - Project → New Ticket
  - Fill all fields
  - Expected: Ticket appears in Kanban board
  - Status: ___

- [ ] **Test 2: Update Ticket**
  - Edit ticket details (title, priority, etc.)
  - Expected: Changes saved, comment count included
  - Status: ___

- [ ] **Test 3: Kanban Drag-and-Drop**
  - Drag ticket between columns
  - Expected: Status updates immediately
  - Status: ___

- [ ] **Test 4: Delete Ticket**
  - Click delete ticket
  - Expected: Ticket removed from board
  - Status: ___

---

### Comments System ✓

- [ ] **Test 1: Add Comment**
  - Ticket → Add comment
  - Expected: Comment appears immediately
  - Status: ___

- [ ] **Test 2: Sanitized Display**
  - Add comment with HTML/script
  - Expected: Displays as text, not rendered
  - Status: ___

- [ ] **Test 3: Comment Count**
  - Add comment
  - Update ticket
  - Expected: Comment count returned in response
  - Status: ___

- [ ] **Test 4: Delete Comment**
  - Add comment, then delete it
  - Expected: Comment removed
  - Status: ___

---

## 🌐 Error Handling Tests

### Network Tests ✓

- [ ] **Test 1: Offline Mode**
  - Disconnect internet
  - Try API call
  - Expected: Friendly error "No internet connection"
  - Status: ___

- [ ] **Test 2: Timeout**
  - Simulate slow network (DevTools)
  - Expected: Timeout error after 10 seconds
  - Status: ___

- [ ] **Test 3: 401 Unauthorized**
  - Delete token from localStorage
  - Make API call
  - Expected: Clear token, redirect to login
  - Status: ___

- [ ] **Test 4: 403 Forbidden**
  - User without permission tries action
  - Expected: "Access denied" error message
  - Status: ___

- [ ] **Test 5: 429 Too Many Requests**
  - Trigger rate limit
  - Expected: "Too many requests" message
  - Status: ___

---

## 📊 Data Integrity Tests

### Database Tests ✓

- [ ] **Test 1: Email Uniqueness**
  - Try registering two users with same email
  - Expected: Second fails with duplicate error
  - Status: ___

- [ ] **Test 2: Foreign Key Constraints**
  - Delete user who owns project
  - Expected: Project also deleted (CASCADE)
  - Status: ___

- [ ] **Test 3: Role Validation**
  - Check project member roles in DB
  - Expected: Only valid roles present (admin, developer, manager, viewer)
  - Status: ___

- [ ] **Test 4: Status Values**
  - Check ticket statuses in DB
  - Expected: Only valid values (todo, in_progress, done)
  - Status: ___

---

## 🎨 UI/UX Tests

### Form Validation ✓

- [ ] **Test 1: Required Fields**
  - Leave form fields empty
  - Expected: Visual error message
  - Status: ___

- [ ] **Test 2: Error Message Clarity**
  - Trigger validation errors
  - Expected: Clear, actionable error messages
  - Status: ___

- [ ] **Test 3: Form Reset**
  - Submit form, then clear
  - Expected: All fields cleared
  - Status: ___

---

### Visual Tests ✓

- [ ] **Test 1: Responsive Design**
  - Test on mobile/tablet/desktop
  - Expected: Layout adjusts properly
  - Status: ___

- [ ] **Test 2: Color Coding**
  - Check priority colors (critical/high/medium/low)
  - Expected: Correct colors displayed
  - Status: ___

- [ ] **Test 3: Loading States**
  - Observe spinner during requests
  - Expected: Clear loading indicators
  - Status: ___

---

## 📈 Performance Tests

### Speed Tests ✓

- [ ] **Test 1: Page Load**
  - Load dashboard
  - Expected: < 3 seconds
  - Status: ___ seconds

- [ ] **Test 2: List Projects**
  - Load projects list
  - Expected: Smooth, no lag
  - Status: ___

- [ ] **Test 3: Filter Tickets**
  - Apply filters to tickets
  - Expected: Updates within 1 second
  - Status: ___

---

## 🔄 Regression Tests

- [ ] **Test 1: Existing Features**
  - All previous features still work
  - Expected: No broken functionality
  - Status: ___

- [ ] **Test 2: Database Migrations**
  - Old data still accessible
  - Expected: No data loss
  - Status: ___

- [ ] **Test 3: API Compatibility**
  - Old mobile app still works (if applicable)
  - Expected: API backwards compatible
  - Status: ___

---

## ✨ Sign-Off Checklist

Before deploying to production:

- [ ] All security tests passed
- [ ] All functional tests passed
- [ ] All error handling tests passed
- [ ] All data integrity tests passed
- [ ] All UI/UX tests passed
- [ ] Performance acceptable
- [ ] No regressions found
- [ ] Code reviewed
- [ ] Database migrations tested
- [ ] Environment variables set
- [ ] SSL certificate configured
- [ ] Monitoring/logging set up

**Final Status: __________________**

**Tested By: ____________________**

**Date: ____________________**

**Ready for Production: ☐ YES  ☐ NO**

**Comments:**
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## 📞 Issue Tracking

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| | | | |
| | | | |
| | | | |

---

*Testing Checklist - Bug Tracker v1.0.1*  
*Last Updated: April 11, 2026*
