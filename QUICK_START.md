# Quick Start Guide

Get the Anonymous Complaints Platform up and running in minutes.

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14+) installed and running
- **Database** (configured via `backend/src/config/database.js`)

## Database Setup

For database setup instructions, see [DATABASE_SETUP_README.md](DATABASE_SETUP_README.md).

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
