# E-Commerce Smart Grocery System

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed    # Create test users
npm run dev     # Start backend server
```

Backend will run on: http://localhost:5000

### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run dev     # Start frontend
```

Frontend will run on: http://localhost:5173

### 3. Test Login Credentials

**Admin:**
- Email: admin@test.com
- Password: admin123

**Accountant:**
- Email: accountant@test.com
- Password: accountant123

**Staff:**
- Email: staff@test.com
- Password: staff123

## What's Connected

✅ Frontend authentication with backend API
✅ JWT token management
✅ Axios interceptors for automatic token injection
✅ Protected routes with role-based access
✅ Toast notifications for user feedback
✅ Vite proxy for seamless API calls
✅ LocalStorage for persistent login

## API Endpoints

- POST /api/auth/login - Login
- POST /api/auth/register - Register
- GET /api/products - Get products (Protected)
- GET /api/sales - Get sales (Protected)
- GET /api/dashboard - Dashboard data (Protected)
