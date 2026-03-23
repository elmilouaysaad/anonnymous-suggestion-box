# Implementation Guide: Technical Setup & Development Instructions

**Project:** Anonymous Suggestion Box Platform  
**Document:** Developer Setup & Implementation Guide  
**Version:** 1.0

---

## TABLE OF CONTENTS

1. [Technology Stack](#technology-stack)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Database Setup](#database-setup)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Guide](#deployment-guide)
9. [Common Development Tasks](#common-development-tasks)

---

## TECHNOLOGY STACK

### Recommended Stack

**Frontend:**
- **Framework:** Vanilla HTML5 + CSS3 + JavaScript (ES6+)
- **Alternative:** React, Vue, or Svelte for larger team
- **Build Tool:** Parcel, Vite, or Webpack
- **State Management:** LocalStorage (minimal approach) or Context API
- **HTTP Client:** Fetch API or Axios
- **Charts:** Chart.js or D3.js for admin analytics
- **Sentiment Analysis Display:** Pre-computed from backend

**Backend:**
- **Runtime:** Node.js (16+) or Python 3.9+
- **Framework:** Express.js (Node) or Flask/FastAPI (Python)
- **Database:** PostgreSQL 12+
- **ORM:** Sequelize (Node) or SQLAlchemy (Python)
- **Authentication:** JSON Web Tokens (JWT)
- **Session Management:** Redis or PostgreSQL
- **API Documentation:** Swagger/OpenAPI
- **NLP Sentiment:** TextBlob, VADER, or AWS Comprehend
- **Keyword Extraction:** NLTK, spaCy, or Rapid Micro Tools

**Infrastructure:**
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (reverse proxy)
- **CI/CD:** GitHub Actions or GitLab CI
- **Cloud Platform:** AWS (EC2, RDS, S3) or Azure App Service

---

## DEVELOPMENT ENVIRONMENT SETUP

### Prerequisites

**System Requirements:**
- Operating System: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- Node.js: v16.x or later (if using Node)
- Python: 3.9+ (if using Python)
- PostgreSQL: 12+ (can use Docker)
- Docker: Latest (optional but recommended)
- Git: 2.30+
- Code Editor: VS Code (recommended)

---

### Installation Steps (Node.js + Express + PostgreSQL)

**1. Install Node.js**
```bash
# Visit https://nodejs.org/
# Download LTS version and install
# Verify installation
node --version
npm --version
```

**2. Install PostgreSQL**
```bash
# Option A: Direct installation
# Visit https://www.postgresql.org/download/

# Option B: Docker (recommended for development)
docker run --name suggestion-box-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=dev_password \
  -e POSTGRES_DB=suggestion_box \
  -p 5432:5432 \
  -d postgres:15
```

**3. Create Project Directory**
```bash
mkdir university-feedback-platform
cd university-feedback-platform
git init

# Create subdirectories
mkdir frontend backend
```

**4. Initialize Backend (Express)**
```bash
cd backend
npm init -y

# Install dependencies
npm install express cors dotenv pg sequelize bcryptjs
npm install --save-dev nodemon jest supertest

# Create project structure
mkdir src
mkdir src/config src/routes src/models src/controllers src/middleware src/utils
touch .env
```

**5. Initialize Frontend**
```bash
cd ../frontend
npm init -y

# For vanilla JS with Parcel bundler
npm install --save-dev parcel-bundler

# Or for React
npm create react-app .

# Create structure
mkdir src
mkdir src/pages src/components src/styles src/utils src/api
```

---

### Environment Configuration

**Backend `.env` file**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=suggestion_box
DB_USER=admin
DB_PASSWORD=dev_password

# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Session
SESSION_SECRET=your_secret_key_here_change_in_production
SESSION_TIMEOUT=14400 # 4 hours in seconds

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRY=7d

# Sentiment Analysis
SENTIMENT_API=textblob # or 'aws' or 'azure'
AWS_REGION=us-east-1
AWS_COMPREHEND_ROLE_ARN=arn:aws:iam::...

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:8080

# Logging
LOG_LEVEL=debug
```

**Frontend `.env` file**
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
```

---

## PROJECT STRUCTURE

### Backend Structure (Express.js)
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # Database connection
│   │   └── env.js              # Environment variables
│   │
│   ├── models/
│   │   ├── Department.js
│   │   ├── Submission.js
│   │   ├── Answer.js
│   │   ├── HelpfulnessFeedback.js
│   │   ├── DepartmentUser.js
│   │   ├── AdminUser.js
│   │   ├── AuditLog.js
│   │   └── KeywordIndex.js
│   │
│   ├── routes/
│   │   ├── public.js           # GET /api/public/*
│   │   ├── department.js       # POST/GET /api/department/*
│   │   ├── admin.js            # GET /api/admin/*
│   │   └── health.js           # GET /health
│   │
│   ├── controllers/
│   │   ├── publicController.js
│   │   ├── departmentController.js
│   │   └── adminController.js
│   │
│   ├── middleware/
│   │   ├── auth.js             # JWT & session validation
│   │   ├── errorHandler.js     # Global error handling
│   │   ├── validation.js       # Input validation
│   │   └── logger.js           # Request logging
│   │
│   ├── services/
│   │   ├── sentimentService.js  # Sentiment analysis
│   │   ├── keywordService.js    # Keyword extraction
│   │   ├── analyticsService.js  # Analytics computation
│   │   └── emailService.js      # Email notifications (future)
│   │
│   ├── utils/
│   │   ├── validators.js       # Validation rules
│   │   ├── helpers.js          # Utility functions
│   │   ├── constants.js        # App constants
│   │   └── errors.js           # Custom error classes
│   │
│   ├── jobs/
│   │   ├── redFlagsJob.js      # Daily red flag detection
│   │   └── sentimentBatchJob.js # Nightly sentiment analysis
│   │
│   └── index.js                # Application entry point
│
├── migrations/
│   ├── 001_init.sql            # Initial schema
│   ├── 002_add_keywords.sql    # Add keyword system
│   └── ...
│
├── seeds/
│   └── seed.sql                # Development data
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Frontend Structure (Vanilla JS)
```
frontend/
├── src/
│   ├── pages/
│   │   ├── home.html
│   │   ├── submit-feedback.html
│   │   ├── tag-page.html
│   │   ├── department-login.html
│   │   ├── department-dashboard.html
│   │   ├── admin-login.html
│   │   └── admin-dashboard.html
│   │
│   ├── components/
│   │   ├── SubmissionForm.js
│   │   ├── AlreadyAnsweredFeed.js
│   │   ├── SubmissionCard.js
│   │   ├── LoginForm.js
│   │   ├── SubmissionList.js
│   │   ├── Modal.js
│   │   ├── Pagination.js
│   │   └── Chart.js
│   │
│   ├── styles/
│   │   ├── global.css          # Reset, variables, typography
│   │   ├── layout.css          # Grids, flexbox, spacing
│   │   ├── components.css      # Component styles
│   │   ├── pages.css           # Page-specific styles
│   │   └── responsive.css      # Media queries
│   │
│   ├── api/
│   │   ├── client.js           # HTTP client setup
│   │   ├── public.js           # Public endpoints
│   │   ├── department.js       # Department endpoints
│   │   └── admin.js            # Admin endpoints
│   │
│   ├── utils/
│   │   ├── storage.js          # LocalStorage wrapper
│   │   ├── validation.js       # Form validation
│   │   ├── formatters.js       # Date/text formatting
│   │   └── handlers.js         # Event handlers
│   │
│   ├── index.html              # Main entry point
│   └── index.js                # App initialization
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## DATABASE SETUP

### PostgreSQL Initialization

**1. Create Database**
```sql
CREATE DATABASE suggestion_box;
CREATE USER suggestion_box_user WITH PASSWORD 'secure_password';
ALTER ROLE suggestion_box_user WITH LOGIN;
GRANT ALL PRIVILEGES ON DATABASE suggestion_box TO suggestion_box_user;
```

**2. Run Migration Script**
```bash
# Using psql
psql -U suggestion_box_user -d suggestion_box -f migrations/001_init.sql

# Or using Node.js migration tool
npm run migrate:up
```

**3. Seed Development Data**
```bash
psql -U suggestion_box_user -d suggestion_box -f seeds/seed.sql
```

### Database Backup & Restore

**Backup:**
```bash
pg_dump -U suggestion_box_user suggestion_box > backup.sql
```

**Restore:**
```bash
psql -U suggestion_box_user suggestion_box < backup.sql
```

---

## BACKEND DEVELOPMENT

### API Endpoint Template

**File:** `src/routes/public.js`

```javascript
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { validateSubmission } = require('../middleware/validation');

// GET /api/public/departments
router.get('/departments', publicController.getDepartments);

// GET /api/public/submissions?department=slug&page=1&limit=10
router.get('/submissions', publicController.getSubmissions);

// POST /api/public/submissions
router.post('/submissions', validateSubmission, publicController.createSubmission);

// POST /api/public/helpfulness
router.post('/helpfulness', publicController.submitHelpfulness);

module.exports = router;
```

**File:** `src/controllers/publicController.js`

```javascript
const { Department, Submission, Answer } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      attributes: ['id', 'name', 'slug'],
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

exports.createSubmission = async (req, res, next) => {
  try {
    const { text, category, department_id } = req.body;
    
    // Validation handled by middleware
    
    // Create submission
    const submission = await Submission.create({
      text,
      category,
      department_id,
      status: 'Pending',
      is_published: false,
      submission_date: new Date()
    });
    
    // Trigger sentiment analysis (async)
    await require('../services/sentimentService').analyze(submission.id);
    
    // Trigger keyword extraction (async)
    await require('../services/keywordService').extract(submission.id);
    
    res.status(201).json({
      success: true,
      message: 'Thank you for your submission. We will get back to you within 2 weeks.',
      data: {
        submission_id: submission.id,
        confirmation_date: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};

// ... other controller methods
```

### Authentication Middleware

**File:** `src/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const { DepartmentUser, AdminUser } = require('../models');

exports.requireDepartmentAuth = async (req, res, next) => {
  try {
    const token = req.headers['x-session-id'];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_AUTH', message: 'No session provided' }
      });
    }
    
    // Validate token (could be JWT or session ID from Redis)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await DepartmentUser.findByPk(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_AUTH', message: 'Invalid or expired session' }
      });
    }
    
    req.user = user;
    req.departmentId = user.department_id;
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Authentication failed' }
    });
  }
};

exports.requireAdminAuth = async (req, res, next) => {
  // Similar to above, but for admin users
};
```

### Sentiment Analysis Service

**File:** `src/services/sentimentService.js`

```javascript
const TextBlob = require('fast-text-classifier');
// Or use:
// const AWS = require('aws-sdk');
// const comprehend = new AWS.Comprehend();

const { Submission } = require('../models');

exports.analyze = async (submissionId) => {
  try {
    const submission = await Submission.findByPk(submissionId);
    
    if (!submission) return;
    
    // Using TextBlob
    const analyzer = new TextBlob(submission.text);
    const polarity = analyzer.getSentiment().polarity;
    
    // Map to sentiment categories
    let sentiment = 'Neutral';
    if (polarity > 0.1) sentiment = 'Positive';
    else if (polarity < -0.1) sentiment = 'Negative';
    
    // Update submission
    await submission.update({ sentiment });
    
    console.log(`Sentiment analyzed for submission ${submissionId}: ${sentiment}`);
  } catch (error) {
    console.error(`Sentiment analysis failed for ${submissionId}:`, error);
  }
};

exports.getSentimentTrend = async (departmentId, days = 30) => {
  // Query and aggregate sentiment data
  const query = `
    SELECT 
      DATE(submitted_date) as date,
      sentiment,
      COUNT(*) as count
    FROM submissions
    WHERE department_id = $1
      AND submitted_date >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(submitted_date), sentiment
    ORDER BY date ASC
  `;
  
  // Return formatted trend data
};
```

---

## FRONTEND DEVELOPMENT

### Page Template (Vanilla JS)

**File:** `src/pages/submit-feedback.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submit Feedback - Anonymous Suggestion Box</title>
  <link rel="stylesheet" href="../styles/global.css">
  <link rel="stylesheet" href="../styles/pages.css">
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="logo">University Feedback Platform</h1>
        <nav class="nav">
          <a href="/">Home</a>
          <a href="/pages/submit-feedback.html" class="active">Submit Feedback</a>
          <a href="/pages/tag-page.html">View Answers</a>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="two-column-layout">
        <!-- Left Column: Form -->
        <aside class="form-section">
          <h2>Share Your Feedback</h2>
          <p class="subtitle">Help us improve. Your feedback is anonymous and confidential.</p>
          
          <form id="submissionForm" class="submission-form">
            <!-- Department Select -->
            <div class="form-group">
              <label for="department">Select a Department *</label>
              <select id="department" name="department" required>
                <option value="">-- Select Department --</option>
                <!-- Options populated by JS -->
              </select>
              <span class="error-message" id="departmentError"></span>
            </div>

            <!-- Category Radio -->
            <div class="form-group">
              <label>Feedback Type *</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" name="category" value="Question" required>
                  <span>Question</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="category" value="Complaint" required>
                  <span>Complaint</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="category" value="Suggestion" required>
                  <span>Suggestion</span>
                </label>
              </div>
              <span class="error-message" id="categoryError"></span>
            </div>

            <!-- Text Area -->
            <div class="form-group">
              <label for="feedback">Your Feedback *</label>
              <textarea 
                id="feedback" 
                name="feedback" 
                rows="8" 
                maxlength="5000" 
                required
                placeholder="Please share your feedback, suggestion, or question...">
              </textarea>
              <div class="char-counter">
                <span id="charCount">0</span> / 5000
              </div>
              <span class="error-message" id="feedbackError"></span>
            </div>

            <!-- Buttons -->
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Submit Feedback</button>
              <button type="reset" class="btn btn-secondary">Clear</button>
            </div>
          </form>
        </aside>

        <!-- Right Column: Feed -->
        <aside class="feed-section">
          <h2>Already Answered</h2>
          <p class="subtitle">Browse previously answered questions</p>
          
          <div class="tags-container" id="tagsContainer">
            <!-- Department tags populated by JS -->
          </div>
        </aside>
      </div>
    </main>

    <!-- Modal -->
    <div id="confirmationModal" class="modal hidden">
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <svg class="modal-icon" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <h2>Thank You!</h2>
        <p>Thank you for your submission. We will get back to you within 2 weeks.</p>
        <button type="button" class="btn btn-primary" id="modalOkBtn">OK, Got It</button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p>&copy; 2026 University. <a href="#">Privacy</a> | <a href="#">Terms</a> | <a href="#">Contact</a></p>
    </footer>
  </div>

  <script src="../utils/client.js"></script>
  <script src="../components/SubmissionForm.js"></script>
  <script src="../api/public.js"></script>
  <script>
    // Initialize page
    document.addEventListener('DOMContentLoaded', () => {
      new SubmissionForm('#submissionForm');
      loadDepartments();
    });
  </script>
</body>
</html>
```

### Component Class (Vanilla JS)

**File:** `src/components/SubmissionForm.js`

```javascript
class SubmissionForm {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.modal = document.getElementById('confirmationModal');
    this.charCounter = document.getElementById('charCount');
    this.feedbackInput = document.getElementById('feedback');
    
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.feedbackInput.addEventListener('input', (e) => this.updateCharCount(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!this.validateForm()) return;
    
    // Get form data
    const formData = new FormData(this.form);
    const data = {
      text: formData.get('feedback'),
      category: formData.get('category'),
      department_id: parseInt(formData.get('department'))
    };
    
    try {
      // Show loading state
      const submitBtn = this.form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      
      // Submit
      const response = await apiClient.post('/api/public/submissions', data);
      
      // Show confirmation
      this.showConfirmation();
      
      // Reset form
      this.form.reset();
      this.updateCharCount();
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Feedback';
    }
  }

  validateForm() {
    const department = document.getElementById('department').value;
    const category = document.querySelector('input[name="category"]:checked');
    const feedback = this.feedbackInput.value.trim();
    
    let isValid = true;
    
    if (!department) {
      document.getElementById('departmentError').textContent = 'Please select a department';
      isValid = false;
    }
    
    if (!category) {
      document.getElementById('categoryError').textContent = 'Please select a feedback type';
      isValid = false;
    }
    
    if (!feedback) {
      document.getElementById('feedbackError').textContent = 'Please enter your feedback';
      isValid = false;
    }
    
    return isValid;
  }

  updateCharCount(e) {
    this.charCounter.textContent = this.feedbackInput.value.length;
  }

  showConfirmation() {
    this.modal.classList.remove('hidden');
    document.getElementById('modalOkBtn').addEventListener('click', () => {
      this.modal.classList.add('hidden');
    });
  }
}
```

### API Client

**File:** `src/api/client.js`

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const apiClient = {
  async request(method, endpoint, data = null, headers = {}) {
    const url = `${API_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    // Add session token if exists
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      options.headers['X-Session-ID'] = sessionToken;
    }
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json.error?.message || 'API error');
      }
      
      return json;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  get(endpoint, headers) {
    return this.request('GET', endpoint, null, headers);
  },

  post(endpoint, data, headers) {
    return this.request('POST', endpoint, data, headers);
  },

  put(endpoint, data, headers) {
    return this.request('PUT', endpoint, data, headers);
  },

  delete(endpoint, headers) {
    return this.request('DELETE', endpoint, null, headers);
  }
};
```

---

## TESTING STRATEGY

### Unit Tests (Backend)

**File:** `tests/unit/models.test.js`

```javascript
const request = require('supertest');
const app = require('../../src/index');
const { Department, Submission } = require('../../src/models');

describe('Submission Model', () => {
  let department;

  beforeAll(async () => {
    department = await Department.create({
      name: 'Test Department',
      slug: 'test-dept'
    });
  });

  test('should create a submission', async () => {
    const submission = await Submission.create({
      text: 'Test feedback',
      category: 'Question',
      department_id: department.id,
      status: 'Pending'
    });

    expect(submission.id).toBeDefined();
    expect(submission.text).toBe('Test feedback');
    expect(submission.status).toBe('Pending');
  });

  test('should not allow deletion', async () => {
    const submission = await Submission.create({
      text: 'Test',
      category: 'Question',
      department_id: department.id
    });

    await expect(submission.destroy()).rejects.toThrow();
  });
});
```

### Integration Tests (API)

**File:** `tests/integration/api.test.js`

```javascript
describe('Public API Endpoints', () => {
  test('POST /api/public/submissions should create submission', async () => {
    const response = await request(app)
      .post('/api/public/submissions')
      .send({
        text: 'Test feedback',
        category: 'Question',
        department_id: 1
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.submission_id).toBeDefined();
  });

  test('GET /api/public/departments should return departments', async () => {
    const response = await request(app).get('/api/public/departments');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/unit/models.test.js

# Run in watch mode
npm test -- --watch
```

---

## DEPLOYMENT GUIDE

### Docker Setup

**File:** `Dockerfile` (Backend)

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/index.js"]
```

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: suggestion_box
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build: ./backend
    ports:
      - "${PORT}:3000"
    environment:
      NODE_ENV: ${NODE_ENV}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src

  # Frontend (development)
  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    volumes:
      - ./frontend/src:/app/src
    environment:
      REACT_APP_API_URL: http://localhost:3000

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
```

### Production Deployment (AWS EC2)

**1. Launch EC2 Instance**
```bash
# Use Ubuntu 20.04 LTS
# Instance type: t3.medium or larger
# Security group: Open ports 80, 443
```

**2. SSH and Install**
```bash
ssh -i key.pem ubuntu@<instance-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install nodejs -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 (process manager)
sudo npm install -g pm2
```

**3. Clone Repository and Setup**
```bash
git clone <repo-url>
cd university-feedback-platform/backend
npm ci --only=production
```

**4. Configure Nginx**
```nginx
upstream api {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.edu;

    location /api {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

**5. Start Services**
```bash
# Start backend with PM2
cd backend
pm2 start src/index.js --name "suggestion-api"
pm2 save
pm2 startup

# Reload Nginx
sudo systemctl reload nginx
```

---

## COMMON DEVELOPMENT TASKS

### Create New API Endpoint

**1. Define Route**
```javascript
// src/routes/department.js
router.get('/submissions/:id', departmentController.getSubmission);
```

**2. Implement Controller**
```javascript
// src/controllers/departmentController.js
exports.getSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findByPk(id);
    
    if (!submission) {
      throw new NotFoundError('Submission not found');
    }
    
    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};
```

**3. Test Endpoint**
```bash
curl http://localhost:3000/api/department/submissions/1 \
  -H "X-Session-ID: your_token_here"
```

### Add Database Migration

**1. Create Migration File**
```sql
-- migrations/003_add_new_field.sql
BEGIN;

ALTER TABLE submissions ADD COLUMN new_field VARCHAR(255);

ALTER TABLE audit_logs ADD COLUMN metadata JSONB;

COMMIT;
```

**2. Run Migration**
```bash
psql -U suggestion_box_user -d suggestion_box -f migrations/003_add_new_field.sql
```

### Update Frontend Component

**1. Create Component**
```javascript
// src/components/NewComponent.js
class NewComponent {
  constructor(selector) {
    this.element = document.querySelector(selector);
    this.init();
  }

  init() {
    // Initialize component
  }

  // Methods...
}
```

**2. Use in HTML**
```html
<div id="newComponent"></div>
<script>
  new NewComponent('#newComponent');
</script>
```

### Add Sentiment Analysis

**1. Update Service**
```javascript
// src/services/sentimentService.js
// Use AWS Comprehend, TextBlob, or similar
```

**2. Integrate in Workflow**
```javascript
// After submission creation
await sentimentService.analyze(submission.id);
```

---

## Debugging Tips

### Backend Debugging

```bash
# Run with verbose logging
NODE_DEBUG=* npm start

# Use Node debugger
node inspect src/index.js
# Chrome DevTools: chrome://inspect

# Use VS Code debugger
# Create .vscode/launch.json:
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/index.js"
    }
  ]
}
```

### Frontend Debugging

```javascript
// Add console logs
console.log('Debug:', variable);

// Use browser DevTools
// F12 -> Sources/Elements tab

// Use debugger statement
debugger; // Pauses execution in DevTools
```

### Database Debugging

```bash
# Connect to PostgreSQL
psql -U suggestion_box_user -d suggestion_box

# Common queries
\dt                     # List tables
\d submissions          # Describe table
SELECT * FROM submissions;
EXPLAIN ANALYZE SELECT ...;  # Query plan
```

---

**Document Version:** 1.0  
**Last Updated:** March 22, 2026  
**Ready for Development:** Yes  
**Maintenance:** Keep updated with latest dependencies
