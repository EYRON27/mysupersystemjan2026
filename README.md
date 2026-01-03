# My Super System

A full-stack productivity application with three main modules: Money Dashboard, Tasks Dashboard, and Password Vault.

## Features

### 💰 Money Dashboard
- Track income and expenses
- View financial summaries by period (daily, weekly, monthly, yearly)
- Categorize transactions
- Real-time balance and savings rate calculations

### ✅ Tasks Dashboard
- Create, edit, and delete tasks
- Track task status (To Do, Ongoing, Completed)
- Set deadlines with overdue notifications
- Filter tasks by status

### 🔐 Password Vault
- Securely store website credentials
- AES-256 encryption for passwords
- Re-authentication required to reveal passwords
- Categorize passwords (Social, Banking, Work, etc.)
- Auto-hide passwords after 10 seconds

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** + **Zod** for form validation
- **Axios** for API requests
- **shadcn/ui** component library

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **PostgreSQL** database (Supabase)
- **JWT** authentication (Access + Refresh tokens)
- **bcrypt** for password hashing
- **AES-256** encryption for stored passwords

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- npm or bun

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mysupersystemjan2026
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
```

4. **Set up environment variables**

Frontend (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

Backend (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_ACCESS_SECRET="your-32-char-access-secret-key"
JWT_REFRESH_SECRET="your-32-char-refresh-secret-key"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
ENCRYPTION_KEY="your-32-character-encryption-key"
FRONTEND_URL="http://localhost:5173"
PORT=3001
NODE_ENV=development
```

5. **Set up the database**
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

6. **Start the development servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend (new terminal):
```bash
npm run dev
```

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variable: `VITE_API_URL=https://your-backend.herokuapp.com/api`
4. Deploy

### Backend (Heroku)
1. Create Heroku app: `heroku create your-app-name`
2. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:hobby-dev`
3. Set config vars:
```bash
heroku config:set JWT_ACCESS_SECRET=your-secret
heroku config:set JWT_REFRESH_SECRET=your-secret
heroku config:set ENCRYPTION_KEY=your-32-char-key
heroku config:set FRONTEND_URL=https://your-app.vercel.app
heroku config:set NODE_ENV=production
```
4. Deploy: `git push heroku main`
5. Run migrations: `heroku run npx prisma migrate deploy`

### Database (Supabase)
1. Create project on Supabase
2. Copy the connection string from Settings > Database
3. Use this URL as `DATABASE_URL` in backend environment

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get financial summary

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/summary` - Get task summary

### Password Vault
- `GET /api/vault` - List vault entries
- `POST /api/vault` - Create vault entry
- `PUT /api/vault/:id` - Update vault entry
- `DELETE /api/vault/:id` - Delete vault entry
- `POST /api/vault/:id/reveal` - Reveal password (requires re-auth)

### Categories
- `GET /api/categories/transactions` - Get transaction categories
- `GET /api/categories/passwords` - Get password categories

## Security Features

- **JWT Token Rotation**: Access tokens expire in 15 minutes, refresh tokens in 7 days
- **Password Hashing**: bcrypt with cost factor 12
- **Vault Encryption**: AES-256 encryption for stored passwords
- **Re-authentication**: Required to reveal vault passwords
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Configured for production domains
- **Helmet**: Security headers middleware

## License

MIT
