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

Open `psql -U postgres` as postgres superuser and run:

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
cd "backend"
npm run dev
```

After the server starts and tables are created:
- Stop backend.
- Re-comment that sync line to avoid accidental schema changes later.

## 5. Seed Initial Departments and Users

You need:
- **At least 1 Department** for submissions
- **At least 1 AdminUser** (Superadmin) for managing dashboard & department users
- **At least 1 DepartmentUser** for department dashboard access
- **Dashboard Users** (optional) for analytics-only access

### 5.1 Generate bcrypt password hashes

From [backend](backend) folder, generate hashes for each password:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('Admin123!',12).then(h=>console.log(h));"
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('DeptUser123!',12).then(h=>console.log(h));"
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('Dashboard123!',12).then(h=>console.log(h));"
```

Save the output hashes.

### 5.2 Insert seed data

In `psql`, use the generated hashes:

**Example hashes:**
- Admin/Superadmin hash: `$2a$12$hESsXJL3B2flCI3WLdbJw.pMG.iXkMddOETqJhwazgq.VlDpiSx9W`
- Department user hash: `$2a$12$al67fJ8VchF3oSPUQO61jeHIfTX0qGugs/rmlTwCxH7IMiNXVGQui`
- Dashboard user hash: `$2a$12$DkG5HchuWH6a9vqHDNoQ9.dMT0rC0CJMauNj8ofzwTrS3DYpeSuMm`

Run this SQL:
psql -U suggestion_box_user -d suggestion_box
```sql
-- Create Departments
INSERT INTO departments (name, slug, description, created_at, updated_at)
VALUES 
  ('IT Services', 'it-services', 'Technical support and infrastructure', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Create Superadmin User (manage all dashboard & department users)
INSERT INTO admin_users (username, password_hash, full_name, email, is_active, permissions, created_at, updated_at)
VALUES 
  ('admin@example.com', '$2a$12$hESsXJL3B2flCI3WLdbJw.pMG.iXkMddOETqJhwazgq.VlDpiSx9W', 'System Administrator', 'admin@example.com', true, ARRAY['read','analytics','write','delete','manage_department_users'], NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Create Dashboard Users (read-only analytics access)
INSERT INTO admin_users (username, password_hash, full_name, email, is_active, permissions, created_at, updated_at)
VALUES 
  ('analytics@example.com', '$2a$12$DkG5HchuWH6a9vqHDNoQ9.dMT0rC0CJMauNj8ofzwTrS3DYpeSuMm', 'Analytics Viewer', 'analytics@example.com', true, ARRAY['read','analytics'], NOW(), NOW()),
  ('manager@example.com', '$2a$12$DkG5HchuWH6a9vqHDNoQ9.dMT0rC0CJMauNj8ofzwTrS3DYpeSuMm', 'Dashboard Manager', 'manager@example.com', true, ARRAY['read','analytics','write'], NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Create Department Users (department-specific access)
INSERT INTO department_users (username, password_hash, department_id, full_name, email, is_active, created_at, updated_at)
SELECT 'it@example.com', '$2a$12$hESsXJL3B2flCI3WLdbJw.pMG.iXkMddOETqJhwazgq.VlDpiSx9W', d.id, 'IT Department Admin', 'it@example.com', true, NOW(), NOW()
FROM departments d WHERE d.slug = 'it-services'
ON CONFLICT (username) DO NOTHING;

```

**User Credentials Summary:**

| User Type | Email | Password | Dashboard | Permissions |
|-----------|-------|----------|-----------|-------------|
| Superadmin | `admin@example.com` | `Admin123!` | Admin Management Panel | Manage all users & submissions |
| Dashboard | `analytics@example.com` | `Dashboard123!` | Analytics Dashboard | Read, Analytics (view-only) |
| Dashboard | `manager@example.com` | `Dashboard123!` | Analytics Dashboard | Read, Analytics, Write |
| Department | `it@example.com` | `Admin123!` | IT Services Dashboard | Department submissions & answers |
submissions & answers |
```

## 6. Verify Database Connectivity

Start backend:

```bash
cd "backend"
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
