# Anonymous Suggestion Box - Design & Development Plan

**Project:** University Staff Anonymous Feedback Platform  
**Date:** March 2026  
**Version:** 1.0

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Frontend Specifications](#frontend-specifications)
5. [Backend Specifications](#backend-specifications)
6. [API Documentation](#api-documentation)
7. [Security & Privacy](#security--privacy)
8. [Implementation Roadmap](#implementation-roadmap)

---

## EXECUTIVE SUMMARY

The Anonymous Suggestion Box is a three-tier web application designed to:
- **Enable anonymous feedback** from university staff without identity tracking
- **Manage submissions** through department-specific dashboards
- **Provide analytics** at the administrative level
- **Maintain complete audit trails** without ever deleting data

### Key Features
- Public submission and view interface
- Department-level management and response workflow
- Administrative analytics and oversight
- Sentiment analysis and keyword clustering
- Responsive, blog-style design

### Tech Stack Recommendation
- **Frontend:** HTML5, CSS3, JavaScript (vanilla or lightweight framework like Alpine.js)
- **Backend:** Node.js/Express or Python/Flask
- **Database:** PostgreSQL (for data integrity and audit trails)
- **Sentiment Analysis:** TextBlob or AWS Comprehend
- **Deployment:** Docker containers, cloud-hosted (AWS/Azure)

---

## SYSTEM ARCHITECTURE

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER TIER                               │
├─────────────────────────────────────────────────────────────┤
│  Public User Page (Submit/View Feedback)                    │
│  ├─ Submission Form                                        │
│  ├─ Already Answered Feed                                  │
│  └─ Tag Pages (Department-specific resolved issues)        │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/HTTPS
┌────────────────▼────────────────────────────────────────────┐
│                   BACKEND API LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  REST API Endpoints                                         │
│  Authentication & Authorization                            │
│  Business Logic & Validation                               │
│  Analytics Engine                                          │
│  Sentiment Analysis Service                                │
└────────────────┬────────────────────────────────────────────┘
                 │ Query/Session
┌────────────────▼────────────────────────────────────────────┐
│                   DATA LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                        │
│  Audit Logs                                                 │
│  Session Management                                        │
└─────────────────────────────────────────────────────────────┘
```

### Application Tiers

#### Tier 1: Public User Interface
- **Accessibility:** No authentication required
- **Functions:** Submit feedback, view answered questions, rate helpfulness
- **Data Isolation:** Only view published/answered items

#### Tier 2: Department Management Interface
- **Accessibility:** Department-specific login credentials
- **Functions:** View assigned submissions, compose answers, publish/hide submissions
- **Data Isolation:** Only view submissions tagged to their department

#### Tier 3: Admin Analytics Interface
- **Accessibility:** Admin-only login credentials
- **Functions:** View system-wide analytics, sentiment trends, performance metrics
- **Data Isolation:** Read-only access to all submissions and analytics

---

## DATABASE SCHEMA

### Core Tables

#### 1. `departments`
```sql
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
**Purpose:** Store all university departments  
**Departments include:** Human Resources, IT Services, Facilities, Finance, General, etc.

---

#### 2. `submissions`
```sql
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  
  -- Content
  text TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('Question', 'Complaint', 'Suggestion')),
  department_id INTEGER NOT NULL REFERENCES departments(id),
  
  -- Status & Visibility
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Answered', 'Hidden')),
  is_published BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Automated Analysis
  sentiment VARCHAR(20),
  keywords TEXT[] DEFAULT '{}',
  
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
```
**Purpose:** Store all user submissions  
**Key Design Decisions:**
- No user identification fields (ensures anonymity)
- Status tracks workflow: Pending → Answered OR Hidden
- Sentiment and keywords populated by background jobs
- `is_published` ensures only answered items are visible to public

---

#### 3. `answers`
```sql
CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  
  -- Relationship
  submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  
  -- Content
  text TEXT NOT NULL,
  
  -- Metadata
  answered_by VARCHAR(255), -- Department staff member (optional)
  answered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
```
**Purpose:** Store official department answers  
**Key Design Decisions:**
- One-to-one relationship with submissions
- Answer triggers automatic publication on tag page
- Staff name is optional (can remain anonymous from user perspective)

---

#### 4. `helpfulness_feedback`
```sql
CREATE TABLE helpfulness_feedback (
  id SERIAL PRIMARY KEY,
  
  -- Relationship
  answer_id INTEGER NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  
  -- Feedback
  is_helpful BOOLEAN NOT NULL, -- True = "Yes", False = "No"
  feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent manipulation
  user_ip_hash VARCHAR(255), -- Hash of user IP for basic rate limiting (not stored raw)
  user_session_id VARCHAR(255), -- Session-based identifier
  
  FOREIGN KEY (answer_id) REFERENCES answers(id),
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
);
```
**Purpose:** Track "Was this answer helpful?" responses  
**Key Design Decisions:**
- No personal identification, only session/IP hash
- Allows multiple entries but tracks session to reduce spam
- linked to both answer and submission for flexibility in queries

---

#### 5. `department_users` (Staff Accounts)
```sql
CREATE TABLE department_users (
  id SERIAL PRIMARY KEY,
  
  -- Credentials
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Relationship
  department_id INTEGER NOT NULL REFERENCES departments(id),
  
  -- Metadata
  full_name VARCHAR(255),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```
**Purpose:** Store department staff credentials  
**Key Design Decisions:**
- Username and password per department user
- Password stored as bcrypt hash (never plaintext)
- Each user belongs to exactly one department

---

#### 6. `admin_users`
```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  
  -- Credentials
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Metadata
  full_name VARCHAR(255),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  permissions TEXT[] DEFAULT '{}', -- Future expansion for role-based access
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```
**Purpose:** Store admin credentials  
**Key Design Decisions:**
- Separate from department users for security isolation
- Permissions field for future RBAC expansion

---

#### 7. `audit_logs`
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  
  -- Action Details
  action VARCHAR(100) NOT NULL, -- e.g., 'submission_created', 'answer_published', 'submission_hidden'
  entity_type VARCHAR(50) NOT NULL, -- 'submission', 'answer', 'user_login'
  entity_id INTEGER,
  
  -- User Info (department users only, admin remains anonymous in logs)
  user_id INTEGER REFERENCES department_users(id) ON DELETE SET NULL,
  is_admin_action BOOLEAN DEFAULT FALSE,
  
  -- Changes (for tracking what was modified)
  old_values JSONB,
  new_values JSONB,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45), -- IPv4 or IPv6
  
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_date (created_at)
);
```
**Purpose:** Immutable audit trail for compliance  
**Key Design Decisions:**
- Append-only, never deleted
- Tracks all significant state changes
- Maintains complete history for audits

---

#### 8. `keywords_index`
```sql
CREATE TABLE keywords_index (
  id SERIAL PRIMARY KEY,
  
  -- Keyword Info
  keyword VARCHAR(255) NOT NULL,
  keyword_stem VARCHAR(255), -- Stemmed version for better matching
  frequency INTEGER DEFAULT 1,
  last_occurrence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(keyword, keyword_stem)
);
```
**Purpose:** Support keyword clustering and theme identification

---

#### 9. `submission_keywords`
```sql
CREATE TABLE submission_keywords (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  keyword_id INTEGER NOT NULL REFERENCES keywords_index(id) ON DELETE CASCADE,
  
  UNIQUE(submission_id, keyword_id)
);
```
**Purpose:** Many-to-many relationship between submissions and keywords

---

### Database Constraints & Rules

**Critical Business Rule Enforcement:**
```sql
-- Prevent deletion of submissions
CREATE TRIGGER prevent_submission_deletion
BEFORE DELETE ON submissions
FOR EACH ROW
EXECUTE FUNCTION raise_deletion_blocked();

CREATE FUNCTION raise_deletion_blocked()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Submissions cannot be deleted. Only hidden or answered.';
END;
$$ LANGUAGE plpgsql;

-- Automatically update status when answer is created
CREATE TRIGGER update_submission_status_on_answer
AFTER INSERT ON answers
FOR EACH ROW
EXECUTE FUNCTION update_submission_answered();

CREATE FUNCTION update_submission_answered()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE submissions
  SET status = 'Answered', is_published = TRUE, updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.submission_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## FRONTEND SPECIFICATIONS

### 1. USER PAGE (Public)

#### Layout Structure
```
┌─────────────────────────────────────────┐
│         HEADER / NAVIGATION              │
│    Anonymous Feedback Platform           │
├──────────────────┬──────────────────────┤
│                  │                      │
│   LEFT COLUMN    │    RIGHT COLUMN     │
│                  │                      │
│ Submission Form  │ Already Answered    │
│                  │ Feed                │
│                  │                      │
│                  │ [Department Tags]   │
│                  │                      │
└──────────────────┴──────────────────────┘
```

#### Component Specifications

##### Left Column: Submission Form

**Form Title**
- Text: "Share Your Feedback"
- Subtitle: "Help us improve. Your feedback is anonymous and confidential."

**Department Tag Dropdown**
```
Label: "Select a Department"
Required: Yes
Options:
  - Human Resources
  - IT Services
  - Facilities
  - Finance
  - General
  - [Any additional departments]
Default: "--Select Department--"
```

**Category Radio Buttons**
```
Label: "Feedback Type"
Required: Yes
Options:
  ○ Question
  ○ Complaint
  ○ Suggestion
```

**Text Input Area**
```
Label: "Your Feedback"
Type: textarea
Required: Yes
Placeholder: "Please share your feedback, suggestion, or question..."
Attributes:
  - No visible character limit
  - Rows: 8-10
  - Max-length (backend): 5000 characters
  - Auto-resize height as user types (optional enhancement)
```

**Submit Button**
```
Text: "Submit Feedback"
Color: Primary (university brand color)
Disabled state: Until all required fields filled
```

**Confirmation Modal**
```
Title: "Thank You!"
Message: "Thank you for your submission. We will get back to you within 2 weeks."
Button: "OK" (closes modal and resets form)
Animation: Fade-in/out, centered on screen
```

**Form Validation (Client-side)**
- Department selected
- Category selected
- Feedback text is not empty
- Feedback text length < 5000 characters
- Real-time feedback on validation status

---

##### Right Column: "Already Answered" Feed

**Section Header**
```
Title: "Already Answered"
Subtitle: "Browse previously answered questions and resolved issues"
```

**Department Tags List**
```
Display: Horizontal or vertical list
Format: Clickable pills/badges
Tags: List of all departments + "General"
Styling:
  - Default: Light background, dark text
  - Hover: Slight color change, pointer cursor
  - Active: Highlighted with primary color
```

**Navigation Logic**
- Clicking a tag navigates to `/tag/{department_slug}`
- URL structure: `/tag/it-services`, `/tag/human-resources`, etc.

---

#### Tag Page (`/tag/{department}`)

**Page Structure**
```
┌─────────────────────────────────────────┐
│         HEADER / NAVIGATION              │
├─────────────────────────────────────────┤
│  Back to Home    [Department Name]      │
├─────────────────────────────────────────┤
│                                         │
│  Post 1                                 │
│  ├─ Original Question/Complaint         │
│  ├─ Submitted: [Date]                   │
│  ├─ Category: [Question/Complaint/...] │
│  ├─ [Divider]                          │
│  ├─ ANSWER:                             │
│  ├─ [Department's Official Response]   │
│  ├─ [Divider]                          │
│  └─ Was this answer helpful?            │
│     [Yes] [No] [Thank you message]      │
│                                         │
│  Post 2 [Similar structure]            │
│                                         │
│  ... [Pagination or Load More]         │
│                                         │
└─────────────────────────────────────────┘
```

**Individual Post Card**
```
Structure:
  - Original Submission Box (light background)
    - Text of original submission
    - Metadata: Submitted date, Category badge
  
  - Divider line
  
  - Answer Box (slightly darker background)
    - Department's official response text
  
  - Divider line
  
  - Helpfulness Section
    - Label: "Was this answer helpful?"
    - Button 1: "Yes" (left-aligned)
    - Button 2: "No" (left-aligned)
    - Response message (appears after click, disappears after 3 seconds)
      - Text: "Thank you for your feedback"
```

**Styling Details**
- Cards have subtle shadows and rounded corners
- Posted dates formatted as "2 weeks ago" or specific date
- Category badges color-coded:
  - Question: Blue
  - Complaint: Red
  - Suggestion: Green

---

### 2. DEPARTMENT PAGE (Password Protected)

#### Login Page (`/department/login`)

**Layout**
```
┌─────────────────────────────────────────┐
│     BRAND / HEADER                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Department Staff Login        │   │
│  │                                 │   │
│  │  Username: [____________]      │   │
│  │  Password: [____________]      │   │
│  │                                 │   │
│  │  [Login Button]                │   │
│  │                                 │   │
│  │  [Error message if applicable] │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Form Specifications**
- Username field: Text input, required
- Password field: Password input, required
- Remember me checkbox: Optional (recommend against for security)
- Login button: Button with loading state
- Error messages: Display invalid credentials (generic, no info leakage)
- Post-login: Redirect to `/department/dashboard`

**Session Management**
- Session timeout: 4 hours of inactivity
- Warning: "Your session will expire in 5 minutes" (at 3h 55m)
- Option to extend session or logout

---

#### Department Dashboard (`/department/dashboard`)

**Page Structure**
```
┌─────────────────────────────────────────┐
│  Header: [Department Name] Dashboard    │
│  Logged in as: [Username] | [Logout]   │
├─────────────────────────────────────────┤
│                                         │
│  FILTERS/SEARCH BAR                    │
│  ├─ Status Filter: [Pending/Answered/  │
│  │   Hidden]                           │
│  ├─ Category Filter: [Question/        │
│  │   Complaint/Suggestion]             │
│  ├─ Sort by: [Newest/Oldest/...] ▼   │
│  └─ Search: [Search text...]_____      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  SUBMISSIONS LIST                      │
│                                         │
│  [Submission Card 1]                   │
│  [Submission Card 2]                   │
│  [Submission Card 3]                   │
│                                         │
│  ... [Pagination]                      │
│                                         │
└─────────────────────────────────────────┘
```

**Submission Card for Department**
```
┌──────────────────────────────────────────┐
│  Status Badge: [Pending/Answered/Hidden]│
│                                          │
│  Original Submission:                   │
│  "[Quote of user's feedback text]"      │
│                                          │
│  Metadata:                              │
│  - Category: Question                   │
│  - Submitted: March 15, 2026            │
│  - Days Pending: 5 days                │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Existing Answer (if Answered)      │ │
│  │ "[Department's response text]"    │ │
│  │ Answered by: [Staff name]          │ │
│  │ Published: Yes                     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ACTIONS:                               │
│  [Answer & Publish] [View] [Hide]      │
│                                          │
└──────────────────────────────────────────┘
```

**List Features**
- **Status Indicators:** Color-coded badges
  - Pending: Orange/Yellow
  - Answered: Green
  - Hidden: Gray
- **Sorting Options:** Most recent, oldest, days pending (longest), category
- **Filtering:** By status, by category
- **Search:** Full-text search of submission text
- **Pagination:** 10-20 items per page

---

#### Answer & Publish Modal

```
┌─────────────────────────────────────────┐
│  Answer This Submission                │
│                                         │
│  Original Submission:                  │
│  "[Quote of user's feedback]"          │
│                                         │
│  Your Response:                        │
│  ┌────────────────────────────────┐   │
│  │ [Compose Answer - textarea]    │   │
│  │                                │   │
│  │ [Helpful tips or guidelines]   │   │
│  │                                │   │
│  │  Character count: 453 / 2000   │   │
│  └────────────────────────────────┘   │
│                                         │
│  Signed by (optional):                 │
│  [Your Name or Department]             │
│                                         │
│  [Cancel] [Save Draft] [Publish]      │
│                                         │
└─────────────────────────────────────────┘
```

**Answer Composition Features**
- Large textarea for response (min 20 chars, max 2000 chars)
- Character counter
- Save draft functionality (auto-save every 30 sec)
- Publish button triggers confirmation
- Pre-publish validation:
  - Answer not empty
  - Minimum length (20 chars)
  - Optional: preview mode

---

#### Hide Submission Modal

```
┌─────────────────────────────────────────┐
│  Hide This Submission                  │
│                                         │
│  Are you sure you want to hide this    │
│  submission?                           │
│                                         │
│  Original Submission:                  │
│  "[Quote of user's feedback]"          │
│                                         │
│  ✓ Submission will remain in your     │
│    records (not deleted)               │
│  ✓ It will not appear on the public   │
│    site                                │
│  ✓ You can answer it later if needed  │
│                                         │
│  Reason for hiding (optional):         │
│  [Text field for internal notes]       │
│                                         │
│  [Cancel] [Confirm Hide]               │
│                                         │
└─────────────────────────────────────────┘
```

---

### 3. ADMIN PAGE (Password Protected)

#### Admin Login Page (`/admin/login`)
- Similar to department login
- URL: `/admin/login`
- Redirect on success: `/admin/dashboard`

#### Admin Dashboard (`/admin/dashboard`)

**Page Structure**
```
┌─────────────────────────────────────────┐
│  ADMIN DASHBOARD                       │
│  Logged in as: [Admin Name] | [Logout] │
├─────────────────────────────────────────┤
│                                         │
│  CONTROLS:                             │
│  Date Range: [Start] to [End]  ▼      │
│  Department Filter: [All/HR/IT/...]   │
│  Refresh Data                          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  KEY METRICS (Card Grid)               │
│                                         │
│  ┌─────────┐ ┌─────────┐              │
│  │ Total   │ │ Pending │              │
│  │Submiss. │ │Submiss. │              │
│  │   427   │ │   18    │              │
│  └─────────┘ └─────────┘              │
│                                         │
│  ┌─────────┐ ┌─────────┐              │
│  │ Answers │ │ Hidden  │              │
│  │Published│ │Submiss. │              │
│  │   405   │ │    4    │              │
│  └─────────┘ └─────────┘              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  CHARTS & ANALYTICS                   │
│                                         │
│  1. Answers per Department (Weekly)    │
│  [Bar Chart]                           │
│                                         │
│  2. Sentiment Trend                    │
│  [Line Chart]                          │
│                                         │
│  3. Red Flags                          │
│  [Alert Cards]                         │
│                                         │
│  4. Engagement Metrics                 │
│  [Table]                               │
│                                         │
│  5. Top Keywords                       │
│  [Word Cloud or Tag Cloud]             │
│                                         │
│  6. Questions by Department            │
│  [Horizontal Bar Chart]                │
│                                         │
│  7. Hidden Submissions                 │
│  [Table]                               │
│                                         │
└─────────────────────────────────────────┘
```

#### Detailed Analytics Components

**1. Answers per Department (Weekly Bar Chart)**
- X-axis: Departments (Human Resources, IT Services, Facilities, Finance, General)
- Y-axis: Number of answers published
- Time period: Last 7 days
- Tooltip: Show exact count on hover
- Color: Different color per department

**2. Sentiment Analysis (Line Chart)**
- Y-axis: Percentage of submissions
- X-axis: Time (weekly or daily)
- Lines: Positive (green), Neutral (blue), Negative (red)
- Legend showing current percentages
- Shows sentiment trend over last 30 days

**3. Red Flags Alert Section**
```
┌──────────────────────────────────────┐
│  ⚠️  DEPARTMENTS NEEDING ATTENTION   │
├──────────────────────────────────────┤
│                                      │
│  Human Resources                     │
│  • 3 submissions > 14 days unanswered│
│  • Oldest: March 1 (21 days)         │
│  Action: [View Submissions]          │
│                                      │
│  Facilities                          │
│  • 1 submission > 14 days unanswered │
│  • Oldest: March 8 (14 days)         │
│  Action: [View Submissions]          │
│                                      │
└──────────────────────────────────────┘
```

**4. Engagement Metrics Table**
```
Department       | Answers | Avg Helpfulness | Helpful % | Unhelpful %
─────────────────┼─────────┼─────────────────┼───────────┼───────────
Human Resources  |   45    |      78%        |    65     |     35
IT Services      |   52    |      82%        |    72     |     28
Facilities       |   38    |      71%        |    58     |     42
Finance          |   42    |      75%        |    61     |     39
General          |   28    |      68%        |    55     |     45
─────────────────┴─────────┴─────────────────┴───────────┴───────────
```

**5. Top Keywords (Word Cloud)**
- Display most frequently mentioned keywords
- Size represents frequency
- Clickable: Click keyword to see related submissions
- Example keywords: "parking", "salary", "software", "equipment", "communication"

**6. Questions by Department (Horizontal Bar Chart)**
- Bars for each department
- Show total submissions per department
- Stackable by category (Questions, Complaints, Suggestions)

**7. Hidden Submissions Table**
```
Date       | Department  | Category   | Reason for Hiding | Status
───────────┼─────────────┼────────────┼──────────────────┼────────
Mar 15     | HR          | Complaint  | Duplicate        | Hidden
Mar 12     | IT Services | Suggestion | Not applicable   | Hidden
Mar 10     | Facilities  | Question   | Already resolved | Hidden
```

---

## BACKEND SPECIFICATIONS

### API Endpoints

#### Public Endpoints (No Authentication)

**1. Get All Submissions for Tag Page**
```
GET /api/public/submissions?department={slug}&page={page}&limit={limit}

Query Parameters:
  - department: Department slug (e.g., "it-services")
  - page: Page number (default: 1)
  - limit: Items per page (default: 10, max: 50)
  - sort: Sort order ("newest", "oldest")

Response:
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": 123,
        "text": "User's original question",
        "category": "Question",
        "submitted_date": "2026-03-15T10:30:00Z",
        "answer": {
          "id": 456,
          "text": "Department's response",
          "answered_date": "2026-03-18T14:20:00Z"
        },
        "helpfulness": {
          "total_votes": 15,
          "helpful_count": 12,
          "helpful_percentage": 80
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 47,
      "per_page": 10
    }
  }
}
```

**2. Get All Departments (for dropdown & tag list)**
```
GET /api/public/departments

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Human Resources",
      "slug": "human-resources"
    },
    {
      "id": 2,
      "name": "IT Services",
      "slug": "it-services"
    },
    ...
  ]
}
```

**3. Submit New Feedback**
```
POST /api/public/submissions

Body:
{
  "text": "User's feedback text",
  "category": "Question|Complaint|Suggestion",
  "department_id": 1
}

Response:
{
  "success": true,
  "message": "Thank you for your submission. We will get back to you within 2 weeks.",
  "data": {
    "submission_id": 456,
    "confirmation_date": "2026-03-20T10:30:00Z"
  }
}
```

**4. Submit Helpfulness Feedback**
```
POST /api/public/helpfulness

Body:
{
  "answer_id": 123,
  "submission_id": 456,
  "is_helpful": true|false
}

Response:
{
  "success": true,
  "message": "Thank you for your feedback"
}
```

---

#### Department Endpoints (Department Authentication Required)

**1. Department Login**
```
POST /api/department/login

Body:
{
  "username": "hr_user1",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "session_id": "abc123xyz789",
    "department": {
      "id": 1,
      "name": "Human Resources"
    },
    "expires_at": "2026-03-20T14:30:00Z"
  }
}
```

**2. Get Department's Submissions**
```
GET /api/department/submissions?status={status}&category={category}&page={page}

Headers:
  X-Session-ID: abc123xyz789

Query Parameters:
  - status: pending|answered|hidden (optional)
  - category: Question|Complaint|Suggestion (optional)
  - page: Page number (default: 1)
  - sort: newest|oldest|days_pending

Response:
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": 123,
        "text": "User's original submission",
        "category": "Question",
        "status": "Pending",
        "submitted_date": "2026-03-15T10:30:00Z",
        "days_pending": 5,
        "answer": null // or answer object if answered
      }
    ],
    "pagination": { ... }
  }
}
```

**3. Create Answer & Publish**
```
POST /api/department/submissions/{submission_id}/answer

Headers:
  X-Session-ID: abc123xyz789

Body:
{
  "text": "Department's official response",
  "answered_by": "John Smith" // optional
}

Response:
{
  "success": true,
  "message": "Answer published successfully",
  "data": {
    "submission_id": 123,
    "answer_id": 456,
    "status": "Answered",
    "is_published": true
  }
}
```

**4. Hide Submission**
```
POST /api/department/submissions/{submission_id}/hide

Headers:
  X-Session-ID: abc123xyz789

Body:
{
  "reason": "Duplicate submission" // optional
}

Response:
{
  "success": true,
  "message": "Submission hidden successfully",
  "data": {
    "submission_id": 123,
    "status": "Hidden"
  }
}
```

**5. Department Logout**
```
POST /api/department/logout

Headers:
  X-Session-ID: abc123xyz789

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### Admin Endpoints (Admin Authentication Required)

**1. Admin Login**
```
POST /api/admin/login

Body:
{
  "username": "admin_user",
  "password": "admin_password"
}

Response:
{
  "success": true,
  "data": {
    "session_id": "admin_session_123",
    "expires_at": "2026-03-20T14:30:00Z"
  }
}
```

**2. Get Dashboard Analytics**
```
GET /api/admin/analytics?start_date={ISO}&end_date={ISO}&department={ids}

Headers:
  X-Admin-Session: admin_session_123

Response:
{
  "success": true,
  "data": {
    "summary": {
      "total_submissions": 427,
      "pending_submissions": 18,
      "answered_submissions": 405,
      "hidden_submissions": 4
    },
    "answers_per_department": [
      {
        "department": "Human Resources",
        "answers_this_week": 8,
        "answers_last_week": 12,
        "trend": -33.3 // percentage change
      },
      ...
    ],
    "red_flags": [
      {
        "department": "Human Resources",
        "unanswered_count": 3,
        "oldest_submission_date": "2026-03-01",
        "days_pending": 21
      }
    ],
    "sentiment_analysis": {
      "positive": 45,
      "neutral": 42,
      "negative": 13,
      "trend": [ ... ] // Historical trend
    },
    "engagement_metrics": [
      {
        "department": "Human Resources",
        "answers_published": 45,
        "total_helpfulness_votes": 120,
        "helpful_count": 94,
        "helpful_percentage": 78.3
      }
    ],
    "top_keywords": [
      { "keyword": "parking", "frequency": 23 },
      { "keyword": "salary", "frequency": 19 },
      { "keyword": "software", "frequency": 17 }
    ],
    "questions_by_department": [
      {
        "department": "Human Resources",
        "total": 65,
        "questions": 25,
        "complaints": 30,
        "suggestions": 10
      }
    ],
    "hidden_submissions": [
      {
        "id": 100,
        "department": "HR",
        "category": "Complaint",
        "hidden_date": "2026-03-15",
        "reason": "Duplicate"
      }
    ]
  }
}
```

**3. Get Submissions by Department (Admin View)**
```
GET /api/admin/submissions?department={id}&status={status}&page={page}

Headers:
  X-Admin-Session: admin_session_123

Response:
{
  "success": true,
  "data": {
    "submissions": [ ... ],
    "pagination": { ... }
  }
}
```

**4. Get Keywords Analysis**
```
GET /api/admin/keywords?limit=20

Headers:
  X-Admin-Session: admin_session_123

Response:
{
  "success": true,
  "data": {
    "keywords": [
      {
        "keyword": "parking",
        "frequency": 23,
        "submissions": [ ... ]
      }
    ]
  }
}
```

**5. Admin Logout**
```
POST /api/admin/logout

Headers:
  X-Admin-Session: admin_session_123

Response:
{
  "success": true,
  "message": "Admin logged out"
}
```

---

### Business Logic & Processing

#### Sentiment Analysis Service
- **Trigger:** When submission is created
- **Method:** TextBlob or AWS Comprehend API
- **Process:**
  1. Extract submission text
  2. Call sentiment API
  3. Store result in `submissions.sentiment` column
  4. Classify as "Positive", "Neutral", or "Negative"
- **Frequency:** Real-time or batch (end of day)

#### Keyword Extraction Service
- **Trigger:** When submission is created AND when answer is published
- **Method:** Natural Language Processing (NLTK, spaCy, or simple regex patterns)
- **Process:**
  1. Extract submission text
  2. Remove stop words (the, a, an, etc.)
  3. Stem/lemmatize words
  4. Filter by minimum frequency and length
  5. Store in `keywords_index` and `submission_keywords`
- **Example Keywords:** parking, salary, software, equipment, communication, deadline

#### Auto-Expiration Warnings (Scheduled Job)
- **Frequency:** Daily at 2 AM
- **Process:**
  1. Query submissions with `status = 'Pending'` and `submitted_date < NOW() - 14 days`
  2. Flag these in `red_flags` for admin dashboard
  3. Optionally notify department via email (future feature)

#### Session Management
- **Session Timeout:** 4 hours of inactivity
- **Session Storage:** Redis or database (depends on scale)
- **Invalidation:** Logout, timeout, or admin revocation

---

## API DOCUMENTATION

### Error Response Format
All errors follow this standardized format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'text' is required",
    "details": {
      "field": "text",
      "reason": "Empty submission text"
    }
  }
}
```

**Standard HTTP Status Codes:**
- `200 OK` - Successful GET/POST/PUT
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## SECURITY & PRIVACY

### Anonymity Guarantees

**What We Don't Collect:**
- Email addresses
- IP addresses (raw) - only hash for rate limiting
- User names or identities
- Cookies for user identification
- Browser fingerprints
- Session tokens tied to user identity

**What We Record (Minimal):**
- Session ID (random token, not tied to identity)
- IP hash (for rate limiting only, not stored)
- Submission timestamp
- Interaction type (for analytics)

---

### Authentication Security

**Department Users:**
- Passwords: Bcrypt hash (cost factor: 12)
- Sessions: Secure random token (minimum 32 bytes)
- Session storage: Server-side (never client-side)
- HTTPS only: All authentication endpoints require TLS 1.2+

**Admin Users:**
- Same as department users
- Additional: IP whitelist option (optional)
- MFA enforcement (future enhancement)

---

### Data Protection

**In Transit:**
- HTTPS/TLS 1.2+ for all endpoints
- HSTS header enabled
- Perfect Forward Secrecy enabled

**At Rest:**
- Database encryption (AES-256)
- Sensitive fields encrypted (passwords, admin credentials)
- Regular backups with encryption

**Access Control:**
- Department users see only their department's submissions
- Admin users see all data (read-only for submissions)
- Strict parameter validation (no SQL injection, XSS prevention)

---

### Privacy Regulations

**GDPR Compliance (if applicable):**
- No personal data collection (except staff creating answers)
- Right to be forgotten: Not applicable (no user tracking)
- Data minimization: Only collect what's necessary

**FERPA Compliance (if applicable for university):**
- Submissions do not contain student records
- If they do: Redact before publishing

---

## IMPLEMENTATION ROADMAP

### Phase 1: Foundation & Database (Weeks 1-2)
**Goals:** Set up infrastructure and core data model

- [ ] Database schema creation (PostgreSQL)
- [ ] User authentication system (department & admin)
- [ ] Session management
- [ ] Audit logging system

**Deliverables:**
- Fully functional database with constraints
- Department and admin user provisioning scripts
- Authentication API endpoints

---

### Phase 2: Public Interface (Weeks 3-4)
**Goals:** Build user-facing submission and viewing experience

- [ ] Public submission form
- [ ] Form validation and submission logic
- [ ] Confirmation modal
- [ ] Tag page design and display
- [ ] Helpfulness voting system

**Deliverables:**
- Fully functional public pages
- All public API endpoints
- Responsive design on desktop, tablet, mobile

---

### Phase 3: Department Interface (Weeks 5-6)
**Goals:** Build department dashboard and submission management

- [ ] Department login page
- [ ] Department dashboard
- [ ] Submission list with filtering/sorting
- [ ] Answer composition modal
- [ ] Hide submission modal
- [ ] Real-time update of submission status

**Deliverables:**
- Fully functional department interface
- All department API endpoints
- Session management with timeout

---

### Phase 4: Analytics & Admin (Weeks 7-8)
**Goals:** Build admin dashboard with analytics

- [ ] Admin login page
- [ ] Dashboard layout and key metrics
- [ ] Bar chart: Answers per department (weekly)
- [ ] Sentiment analysis integration
- [ ] Red flags detection and display
- [ ] Engagement metrics table
- [ ] Keyword extraction and display
- [ ] Hidden submissions tracking

**Deliverables:**
- Fully functional admin dashboard
- All admin API endpoints
- Sentiment analysis service
- Keyword extraction service

---

### Phase 5: Polishing & Testing (Weeks 9-10)
**Goals:** Quality assurance, optimization, and deployment

- [ ] Unit tests for API endpoints
- [ ] Integration tests for workflows
- [ ] Security testing (OWASP Top 10)
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Documentation completion
- [ ] Deployment configuration (Docker, CI/CD)

**Deliverables:**
- Test suite with >80% coverage
- Security audit report
- Deployment pipeline
- User documentation

---

### Phase 6: Deployment & Monitoring (Weeks 11-12)
**Goals:** Production deployment and ongoing monitoring

- [ ] Deploy to staging environment
- [ ] User acceptance testing
- [ ] Deploy to production
- [ ] Set up monitoring and alerting
- [ ] Staff training sessions

**Deliverables:**
- Production-ready application
- Monitoring dashboards
- Runbooks for common issues
- Staff training materials

---

## Future Enhancements

1. **Email Notifications**
   - Department staff notified when new submissions arrive
   - Admin notified of red flags autonomously

2. **Multi-language Support**
   - Support for additional languages spoken at university
   - Auto-translation option

3. **Escalation System**
   - Critical submissions automatically escalated to admin
   - Define escalation rules

4. **Advanced Analytics**
   - Predictive analytics: Forecast common issues
   - Department benchmarking
   - Trend analysis

5. **API Rate Limiting**
   - Per-IP rate limiting for public endpoints
   - Spam detection and prevention

6. **Admin Features**
   - Manual topic tagging override
   - Bulk operations (hide multiple, batch publish)
   - Custom report generation

7. **Survey/Polling**
   - Optional survey questions attached to submissions
   - Aggregate survey results

---

## Success Metrics

- **Submission Volume:** >50 submissions per month
- **Response Time:** >95% of submissions answered within 14 days
- **Helpfulness Score:** >75% average helpfulness rating
- **System Uptime:** 99.5% minimum
- **User Satisfaction:** >80% positive sentiment in submissions
- **Department Engagement:** All departments actively responding

---

**Document Version:** 1.0  
**Last Updated:** March 22, 2026  
**Next Review:** Upon completion of Phase 2
