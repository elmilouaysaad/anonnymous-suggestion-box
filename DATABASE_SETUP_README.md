# Database Setup README (PostgreSQL)

This guide sets up the database for the Anonymous Suggestion Box project on Windows.

## 1. Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ installed
- Backend dependencies installed (`npm install` in backend)

## 2. Backend Environment Variables

Use [backend/.env.example](backend/.env.example) as reference and ensure [backend/.env](backend/.env) has valid values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=suggestion_box
DB_USER=suggestion_box_user
DB_PASSWORD=secure_password_change_me
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
JWT_SECRET=change_this_to_a_long_random_secret
SESSION_TIMEOUT=4h
CORS_ORIGIN=http://localhost:3001,http://localhost:8080,http://localhost
```

Important:
- `SESSION_TIMEOUT` should be `4h` (compatible with JWT `expiresIn` in current code).
- `JWT_SECRET` must be set.

## 3. Create PostgreSQL User and Database

Open `psql` as postgres superuser and run:

```sql
CREATE USER suggestion_box_user WITH PASSWORD 'secure_password_change_me';
CREATE DATABASE suggestion_box OWNER suggestion_box_user;
GRANT ALL PRIVILEGES ON DATABASE suggestion_box TO suggestion_box_user;
```

If user/database already exists, skip errors and continue.

## 4. Create Tables from Sequelize Models

This project currently uses Sequelize models and has no migration files yet.

- Open [backend/src/index.js](backend/src/index.js)
- Find the sync line under the comment `Sync models`.
- Temporarily uncomment:

```js
await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
```

Then run backend once:

```bash
cd "C:/Users/proes/Downloads/annonimous complaints/backend"
npm run dev
```

After the server starts and tables are created:
- Stop backend.
- Re-comment that sync line to avoid accidental schema changes later.

## 5. Seed Initial Department and Admin Accounts

You need at least one department user and one admin user to log in to dashboards.

### 5.1 Generate bcrypt password hash

From [backend](backend) folder:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('Admin123!',12).then(h=>console.log(h));"
```

Copy the hash output.

### 5.2 Insert seed rows

In `psql`, replace `HASH_HERE` with generated hash:

$2a$12$iKro6zJ3hXkVnz4DuzAlzuPjjQau9OtQFav/d3oZi6yjWYIXBt8ES

```sql
INSERT INTO departments (name, slug, description, created_at, updated_at)
VALUES ('IT Services', 'it-services', 'Technical support', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO department_users (username, password_hash, department_id, full_name, email, is_active, created_at, updated_at)
SELECT 'deptadmin', '$2a$12$iKro6zJ3hXkVnz4DuzAlzuPjjQau9OtQFav/d3oZi6yjWYIXBt8ES', d.id, 'Department Admin', 'dept@example.com', true, NOW(), NOW()
FROM departments d
WHERE d.slug = 'it-services'
ON CONFLICT (username) DO NOTHING;

INSERT INTO admin_users (username, password_hash, full_name, email, is_active, permissions, created_at, updated_at)
VALUES ('superadmin', '$2a$12$iKro6zJ3hXkVnz4DuzAlzuPjjQau9OtQFav/d3oZi6yjWYIXBt8ES', 'System Admin', 'admin@example.com', true, ARRAY['read','analytics'], NOW(), NOW())
ON CONFLICT (username) DO NOTHING;
```

## 6. Verify Database Connectivity

Start backend:

```bash
cd "C:/Users/proes/Downloads/annonimous complaints/backend"
npm run dev
```

Check health endpoint:

- http://localhost:3000/health

Expected: healthy status and successful DB connection.

## 7. Common Issues

### Authentication error (`401`) after login

- Ensure `JWT_SECRET` is set in [backend/.env](backend/.env).
- Ensure seeded users have bcrypt hashes, not plain text passwords.

### Backend cannot connect to DB

- Confirm PostgreSQL service is running.
- Verify `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` in [backend/.env](backend/.env).

### Tables not found

- Re-enable temporary sync in [backend/src/index.js](backend/src/index.js), run backend once, then disable sync again.

## 8. Next Recommended Improvement

Add proper migration and seed scripts in `backend/migrations` and `backend/seeds` so setup no longer depends on temporary model sync.
