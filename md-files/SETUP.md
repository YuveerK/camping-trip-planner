# CampPlan — Setup Guide

## Prerequisites
- Node.js 18+
- npm 9+
- A Neon PostgreSQL account (neon.tech)

---

## 1. Neon PostgreSQL Setup

1. Go to https://neon.tech and create a free account.
2. Create a new project called `camping-planner`.
3. Copy the **Connection string** (it looks like):
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

---

## 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `server/.env`:
```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="change-this-to-a-long-random-string-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
```

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates all tables in Neon)
npm run db:migrate

# (Optional) Seed the database with demo data
npm run db:seed

# Start the dev server
npm run dev
```

The API will be running at: http://localhost:5000

---

## 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start the dev server
npm run dev
```

The app will be running at: http://localhost:5173

---

## 4. Running Both Simultaneously

Open two terminal windows:

**Terminal 1 (backend):**
```bash
cd server && npm run dev
```

**Terminal 2 (frontend):**
```bash
cd client && npm run dev
```

---

## 5. Database Commands

```bash
# View your database in a GUI
npm run db:studio

# Create a new migration after schema changes
npm run db:migrate

# Deploy migrations in production
npm run db:migrate:prod

# Reset the database (WARNING: deletes all data)
npm run db:reset
```

---

## 6. Manual Testing

### Register a user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Yuveer","email":"yuveer@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"yuveer@example.com","password":"password123"}'
```

### Create a trip (use the token from login)
```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Weekend Braai","location":"Magaliesburg"}'
```

---

## 7. Production Build

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
# Output is in client/dist/
```

---

## 8. Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret key for JWT signing | `super-secret-key-32chars+` |
| `JWT_EXPIRES_IN` | JWT token lifetime | `7d` |
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (.env)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 9. Demo Credentials (if you ran the seed)

```
Email: demo@camping.app
Password: password123
```
