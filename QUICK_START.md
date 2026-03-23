# Quick Start Guide

Get the Anonymous Complaints Platform up and running in minutes.

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14+) installed and running
- **Database** (configured via `backend/src/config/database.js`)

## Database Setup

### 1. Create Database User and Database

Open PostgreSQL (`psql`) and run:

```sql
CREATE USER suggestion_box_user WITH PASSWORD 'secure_password_change_me';
CREATE DATABASE suggestion_box OWNER suggestion_box_user;
GRANT ALL PRIVILEGES ON DATABASE suggestion_box TO suggestion_box_user;
```

### 2. Configure Environment Variables

Create or update `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=suggestion_box
DB_USER=suggestion_box_user
DB_PASSWORD=secure_password_change_me
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
SESSION_TIMEOUT=4h
CORS_ORIGIN=http://localhost:5500
```

### 3. Create Tables

In `backend/src/index.js`, temporarily uncomment the sync line:

```js
await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
```

Run backend once to create tables:

```bash
cd backend
npm run dev
```

Then **re-comment the sync line** to prevent accidental schema changes.

### 4. Seed Initial Data (Admin & Departments)

Generate a bcrypt password hash:

```bash
cd backend
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('Admin123!',12).then(h=>console.log(h));"
```

Copy the hash output, then run in PostgreSQL:

```sql
-- Add General department
INSERT INTO departments (name, slug, description, created_at, updated_at)
VALUES ('General', 'general', 'General inquiries and feedback', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Add admin user (replace HASH_HERE with your generated hash)
INSERT INTO admin_users (username, password_hash, full_name, email, is_active, permissions, created_at, updated_at)
VALUES ('admin', 'HASH_HERE', 'System Admin', 'admin@example.com', true, ARRAY['read','write','analytics'], NOW(), NOW())
ON CONFLICT (username) DO NOTHING;
```

✅ Database is now ready!

For detailed database setup instructions, see [DATABASE_SETUP_README.md](DATABASE_SETUP_README.md).

## Installation

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

The API will run on `http://localhost:3000` (or your configured PORT)

### Start Frontend (in a new terminal)

```bash
cd frontend
npm start
```

The frontend will open in your browser at `http://localhost:5500` (or configured port)

## Access the App

- **Home Page**: `http://localhost:5500`
- **Submit Feedback**: Click "Submit Your Feedback" on home page
- **Browse Answers**: Click "Browse Answered Questions" on home page
- **Admin Dashboard**: Contact your administrator for access

## Project Structure

```
backend/
  ├── src/
  │   ├── config/       # Database configuration
  │   ├── middleware/   # Auth, CORS, validation
  │   ├── models/       # Data models
  │   ├── routes/       # API endpoints
  │   └── utils/        # Helpers & logging
  └── package.json

frontend/
  ├── src/
  │   ├── pages/        # Page components
  │   ├── styles/       # CSS styling
  │   ├── api/          # Backend API client
  │   └── index.html    # Main entry point
  └── package.json
```

## Key Features

✅ **Submit Feedback** - Anonymous submissions via web form  
✅ **Browse Answers** - View department responses  
✅ **Admin Dashboard** - Manage submissions and answers  
✅ **Department Filtering** - Organize feedback by department  
✅ **Helpfulness Voting** - Rate answer quality  

## Documentation

- **Project Overview**: See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **Database Setup**: See [DATABASE_SETUP_README.md](DATABASE_SETUP_README.md)
- **Design System**: See [UI_UX_WIREFRAMES_AND_DESIGN_SYSTEM.md](UI_UX_WIREFRAMES_AND_DESIGN_SYSTEM.md)
- **Development Guide**: See [DEVELOPER_QUICK_REFERENCE.md](DEVELOPER_QUICK_REFERENCE.md)

## Troubleshooting

### Backend won't start
- Check Node.js is installed: `node --version`
- Verify database connection in `backend/src/config/database.js`
- Check for port conflicts (default 3000)

### Frontend won't load
- Ensure backend is running first
- Check frontend port (default 5500)
- Clear browser cache: `Ctrl+Shift+Delete`

### Database connection issues
- Verify credentials in `backend/src/config/database.js`
- Ensure database server is running
- Check network connectivity

## Need Help?

Refer to the detailed guides:
- Installation issues → [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- Development setup → [DEVELOPER_QUICK_REFERENCE.md](DEVELOPER_QUICK_REFERENCE.md)
- Architecture details → [DESIGN_AND_DEVELOPMENT_PLAN.md](DESIGN_AND_DEVELOPMENT_PLAN.md)

---

**Happy contributing!** 🚀
