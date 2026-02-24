# 🧪 E-commerce Application Testing Checklist

## ✅ System Overview
- **Backend**: Node.js + Express (Port 5000)
- **Frontend**: React + Vite (Port 5173)
- **Database**: MongoDB (Local)
- **Email Service**: Gmail SMTP

---

## 🔧 Pre-Testing Setup

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
✅ Server should start on port 5000
✅ MongoDB connection successful

### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
✅ App should start on port 5173

---

## 🧪 Testing Checklist

### 1. Authentication & Authorization ✅

#### Login System
- [ ] Admin can login with credentials
- [ ] Accountant can login with credentials
- [ ] Staff can login with credentials
- [ ] Invalid credentials show error
- [ ] JWT token stored in localStorage
- [ ] Auto-redirect to dashboard after login

#### Registration
- [ ] New admin can register
- [ ] Email validation works
- [ ] Password strength validation
- [ ] Duplicate email prevention

#### Staff Registration (Invitation Link)
- [ ] Admin can add staff member
- [ ] Email invitation sent successfully
- [ ] Staff registration link works
- [ ] Email and role fields are locked
- [ ] Staff can complete registration
- [ ] User account created after registration

---

### 2. Staff Management System ✅

#### Add Staff
- [ ] Admin can add new staff
- [ ] Employee ID auto-generated (Company Initials + Number)
- [ ] Email invitation sent with registration link
- [ ] Department field optional
- [ ] Role selection (Staff/Accountant/Manager)

#### Staff List
- [ ] All staff members displayed
- [ ] Status badges (Active/Pending/Inactive)
- [ ] Registration status visible
- [ ] Joining date displayed

#### Staff Actions (3-dot menu)
- [ ] **View Profile** - Shows complete staff details including:
  - Personal Information (Name, Email, Mobile, Role, Employee ID, Department, Joining Date, Status)
  - Bank Details (Bank Name, Account Holder Name, Account Number, IFSC Code)
- [ ] **Edit** - Update staff details
- [ ] **Toggle Status** - Active/Inactive
- [ ] **Confirm Registration** - For pending staff
- [ ] **Delete** - Remove staff (deletes both Staff and User records)

---

### 3. Profile Management ✅

#### Admin Profile
- [ ] Shows actual database data (no dummy data)
- [ ] Employee ID displayed
- [ ] Department displayed
- [ ] Email displayed
- [ ] Mobile displayed
- [ ] Joining date displayed

#### Accountant Profile
- [ ] Auto-fills Employee ID
- [ ] Auto-fills Department
- [ ] Auto-fills Email
- [ ] Auto-fills Phone
- [ ] Auto-fills Joining Date

#### Staff Profile
- [ ] Auto-fills Employee ID
- [ ] Auto-fills Department
- [ ] Auto-fills Joining Date

---

### 4. UI/UX Improvements ✅

#### Navbar
- [ ] Search bar removed
- [ ] Notification bell removed
- [ ] Only profile section visible (top right)
- [ ] Profile dropdown works
- [ ] Logout functionality works

#### Staff Registration Page
- [ ] Compact form design
- [ ] Email field locked with lock icon
- [ ] Role field locked with lock icon
- [ ] Responsive layout
- [ ] Form validation works
- [ ] Password visibility toggle

---

### 5. Email System ✅

#### Staff Invitation Email
- [ ] Modern gradient design
- [ ] Welcome badge visible
- [ ] Info boxes for credentials
- [ ] Security warning included
- [ ] Registration link works
- [ ] Professional styling

---

### 6. Database Models ✅

#### User Model
- [ ] employeeId field
- [ ] department field
- [ ] bankName field
- [ ] accountNumber field
- [ ] ifscCode field
- [ ] accountHolderName field

#### Staff Model
- [ ] employeeId field
- [ ] department field
- [ ] isRegistered flag
- [ ] status field

---

### 7. API Endpoints ✅

#### Staff Routes
- [ ] GET `/api/staff` - Get all staff (Protected)
- [ ] POST `/api/staff` - Add staff (Protected)
- [ ] GET `/api/staff/:id` - Get staff by ID
- [ ] PUT `/api/staff/:id` - Update staff (Protected)
- [ ] PUT `/api/staff/:id/confirm` - Confirm registration (Protected)
- [ ] DELETE `/api/staff/:id` - Delete staff (Protected)
- [ ] POST `/api/staff/complete-registration` - Complete registration (Public)

#### User Routes
- [ ] GET `/api/users/staff/:staffId` - Get staff user profile (Admin only)
- [ ] PUT `/api/users/reset-password` - Reset password (Protected)

#### Auth Routes
- [ ] POST `/api/auth/login` - Login
- [ ] POST `/api/auth/register` - Register

---

### 8. Role-Based Access Control ✅

#### Admin Access
- [ ] Can view all staff
- [ ] Can add staff
- [ ] Can edit staff
- [ ] Can delete staff
- [ ] Can view staff profiles
- [ ] Can confirm registrations

#### Accountant Access
- [ ] Limited access to staff management
- [ ] Can view own profile

#### Staff Access
- [ ] Can view own profile
- [ ] Cannot access staff management

---

### 9. Data Flow Testing ✅

#### Staff Addition Flow
1. [ ] Admin adds staff → Staff record created
2. [ ] Employee ID auto-generated
3. [ ] Email sent with invitation link
4. [ ] Staff clicks link → Registration page opens
5. [ ] Staff completes registration → User account created
6. [ ] Staff can login → Dashboard accessible

#### Profile View Flow
1. [ ] Admin clicks "View Profile" on staff
2. [ ] API fetches user data by staffId
3. [ ] Modal displays complete profile
4. [ ] Personal info section visible
5. [ ] Bank details section visible

---

### 10. Error Handling ✅

- [ ] Invalid login credentials
- [ ] Duplicate email registration
- [ ] Invalid invitation link
- [ ] Network errors handled
- [ ] Form validation errors
- [ ] API error messages displayed

---

### 11. Security Features ✅

- [ ] JWT authentication
- [ ] Password hashing (bcrypt)
- [ ] Protected routes
- [ ] Role-based authorization
- [ ] Email/Role locking in staff registration
- [ ] Token expiration handling

---

### 12. Performance & Optimization ✅

- [ ] Fast page load times
- [ ] Smooth transitions
- [ ] No console errors
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Optimized API calls
- [ ] Proper loading states

---

## 🚀 Deployment Readiness

### Backend
- [ ] Environment variables configured
- [ ] MongoDB connection string set
- [ ] Email credentials configured
- [ ] Port configuration correct
- [ ] CORS enabled for frontend URL

### Frontend
- [ ] API base URL configured
- [ ] Build process works (`npm run build`)
- [ ] No hardcoded credentials
- [ ] Environment variables set

---

## 📝 Known Issues & Limitations

1. **Email Service**: Requires Gmail App Password setup
2. **Database**: Currently using local MongoDB
3. **File Upload**: Not implemented for profile pictures
4. **Bank Details**: Currently display-only (no edit functionality)

---

## 🎯 Next Steps for Production

1. **Deploy Backend**: Use services like Heroku, AWS, or DigitalOcean
2. **Deploy Frontend**: Use Vercel, Netlify, or AWS S3
3. **Database**: Migrate to MongoDB Atlas (cloud)
4. **Email**: Consider using SendGrid or AWS SES
5. **Security**: Add rate limiting, input sanitization
6. **Monitoring**: Add error tracking (Sentry)
7. **Backup**: Implement database backup strategy

---

## ✅ Final Verification

### Quick Test Sequence
1. Start backend server
2. Start frontend app
3. Register new admin
4. Login as admin
5. Add new staff member
6. Check email for invitation
7. Complete staff registration
8. Login as staff
9. View staff profile as admin
10. Verify all data displays correctly

---

## 📞 Support Information

- **Developer**: Hemant Verma
- **Email**: hemantxverma07@gmail.com
- **Phone**: +91 8357071540

---

**Last Updated**: February 2024
**Version**: 1.0.0
**Status**: ✅ Ready for Deployment
