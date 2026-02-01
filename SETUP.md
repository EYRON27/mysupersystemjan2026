# 🚀 MySuperSystem - Complete Setup Guide

This guide will help you set up and run the MySuperSystem application.

## 📋 Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL Database** - Local or cloud (see options below)
3. **Git** - [Download here](https://git-scm.com/)

---

## 🗄️ Database Setup Options

### Option 1: Supabase (Recommended - Free & Easy)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and create a new project
3. Wait for the project to be ready (~2 minutes)
4. Go to **Settings** → **Database** → **Connection string**
5. Select **URI** and copy the connection string
6. Replace `[YOUR-PASSWORD]` with your database password

**Your DATABASE_URL will look like:**
```
postgresql://postgres.[project-ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### Option 2: Local PostgreSQL

1. Download and install [PostgreSQL](https://www.postgresql.org/download/)
2. During installation, remember your password
3. Open pgAdmin or psql and create a database:
```sql
CREATE DATABASE mysupersystem;
```
4. Your DATABASE_URL:
```
postgresql://postgres:yourpassword@localhost:5432/mysupersystem
```

### Option 3: Neon (Serverless PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from the dashboard
4. Your DATABASE_URL will look like:
```
postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Option 4: Railway

1. Go to [railway.app](https://railway.app) and create an account
2. Create a new project → Add PostgreSQL
3. Go to Connect → Copy connection string

---

## 🔧 Environment Setup

### Step 1: Backend Environment

Create or edit the file `backend/.env`:

```env
# ================================
# DATABASE CONFIGURATION
# ================================
# Paste your database URL here:
DATABASE_URL="YOUR_DATABASE_URL_HERE"

# ================================
# JWT SECRETS
# ================================
JWT_ACCESS_SECRET="mysupersystem-access-secret-key-2024-very-secure-32chars"
JWT_REFRESH_SECRET="mysupersystem-refresh-secret-key-2024-very-secure-32chars"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

# ================================
# ENCRYPTION
# ================================
AES_SECRET_KEY="mysupersystem-aes-encryption-32!"

# ================================
# SERVER
# ================================
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# ================================
# RATE LIMITING
# ================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2: Frontend Environment

The file `.env` in the root should contain:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📦 Installation

### Step 1: Install Frontend Dependencies

Open terminal in project root:

```bash
npm install
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Initialize Database

Still in the `backend` folder:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push
```

If successful, you should see:
```
✔ Your database is now in sync with your Prisma schema.
```

---

## 🚀 Running the Application

You need **two terminal windows**:

### Terminal 1 - Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📦 Environment: development
🔗 Frontend URL: http://localhost:5173
```

### Terminal 2 - Frontend Server

Open a new terminal in the project root:

```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## ✅ Verify Setup

1. Open http://localhost:5173 in your browser
2. Click "Get Started Free" to create an account
3. Fill in your details and sign up
4. You should be redirected to the Money Dashboard

### Test API Health

Visit: http://localhost:5000/api/health

You should see:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-01-31T...",
  "environment": "development"
}
```

---

## 🐛 Troubleshooting

### "Can't reach database server"
- Make sure your DATABASE_URL is correct
- For cloud databases, check if your IP is allowed
- For local PostgreSQL, ensure the service is running

### "Prisma schema out of sync"
```bash
cd backend
npx prisma db push --force-reset
```
⚠️ This will delete all data!

### "Port 5000 already in use"
Change the port in `backend/.env`:
```env
PORT=5001
```

### "CORS error"
Make sure `FRONTEND_URL` in backend/.env matches your frontend URL

### Frontend shows "Network Error"
- Make sure the backend is running
- Check that `VITE_API_URL` in `.env` is correct

---

## 📊 View Database with Prisma Studio

To view and edit your database visually:

```bash
cd backend
npx prisma studio
```

This opens a web interface at http://localhost:5555

---

## 🚀 Deployment Checklist

Before deploying to production:

1. ✅ Change all secret keys to strong random values
2. ✅ Set `NODE_ENV=production`
3. ✅ Update `FRONTEND_URL` to your production URL
4. ✅ Use a production database (not localhost)
5. ✅ Enable HTTPS
6. ✅ Review rate limiting settings

---

## 📚 Useful Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend (run from backend folder)
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed default data
```

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Make sure all environment variables are set correctly
3. Check terminal output for error messages
4. Ensure both backend and frontend are running

---

Happy coding! 🎉
