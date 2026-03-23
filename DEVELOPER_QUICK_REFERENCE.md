# Developer Quick Reference Card

**Anonymous Suggestion Box Platform - Developer Cheat Sheet**

---

## ENVIRONMENT VARIABLES

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=suggestion_box
DB_USER=suggestion_box_user
DB_PASSWORD=secure_password

# API
API_URL=http://localhost:3000
NODE_ENV=development
PORT=3000

# Security
JWT_SECRET=change_me_in_production
SESSION_SECRET=change_me_in_production
SESSION_TIMEOUT=14400

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:8080
```

---

## API ENDPOINTS QUICK REFERENCE

### Public (No Auth Required)
```
GET    /api/public/departments
GET    /api/public/submissions?department={slug}&page={page}
POST   /api/public/submissions
POST   /api/public/helpfulness
```

### Department (Auth Required: X-Session-ID)
```
POST   /api/department/login
GET    /api/department/submissions
POST   /api/department/submissions/{id}/answer
POST   /api/department/submissions/{id}/hide
POST   /api/department/logout
```

### Admin (Auth Required: X-Admin-Session)
```
POST   /api/admin/login
GET    /api/admin/analytics
GET    /api/admin/submissions
GET    /api/admin/keywords
POST   /api/admin/logout
```

---

## DATABASE TABLES SUMMARY

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `departments` | University departments | id, name, slug |
| `submissions` | User feedback | id, text, category, department_id, status |
| `answers` | Official responses | id, submission_id, text, answered_date |
| `helpfulness_feedback` | Vote tracking | id, answer_id, is_helpful |
| `department_users` | Staff accounts | id, username, password_hash, department_id |
| `admin_users` | Admin accounts | id, username, password_hash |
| `audit_logs` | Change history | id, action, entity_type, created_at |
| `keywords_index` | Keywords | id, keyword, frequency |
| `submission_keywords` | Keyword mapping | submission_id, keyword_id |

---

## FORM VALIDATION RULES

**Submission Form:**
- Department: Required, must be valid ID
- Category: Required, must be one of (Question, Complaint, Suggestion)
- Feedback: Required, 1-5000 characters

**Department Login:**
- Username: Required, 3-50 chars
- Password: Required, min 6 chars

**Answer Form:**
- Text: Required, 20-2000 characters
- Department: Auto-filled from session

---

## ERROR CODES

```javascript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message"
  }
}
```

**Common Codes:**
- `VALIDATION_ERROR` - Invalid input
- `AUTH_ERROR` - Login/credentials issue
- `NOT_FOUND` - Resource doesn't exist
- `FORBIDDEN` - Not authorized
- `DATABASE_ERROR` - DB operation failed
- `SERVER_ERROR` - Unexpected error

---

## HTTP STATUS CODES

| Code | Usage |
|------|-------|
| 200 | GET/PUT/PATCH success |
| 201 | POST success (created) |
| 204 | DELETE success |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 500 | Server error |

---

## COLOR PALETTE

```css
--primary: #2563eb    /* Blue - CTAs */
--success: #10b981    /* Green - Helpful/positive */
--danger: #ef4444     /* Red - Errors/complaints */
--warning: #f59e0b    /* Amber - Pending/warnings */
--gray: #6b7280       /* Gray - Secondary text */
--light-gray: #f3f4f6 /* Light gray - Backgrounds */
--dark-text: #111827  /* Almost black */
--white: #ffffff      /* White background */
```

**Category Colors:**
- Question: #3b82f6 (blue)
- Complaint: #ef4444 (red)  
- Suggestion: #10b981 (green)

**Status Colors:**
- Pending: #fef3c7 (amber background)
- Answered: #dcfce7 (green background)
- Hidden: #f3f4f6 (gray background)

---

## CSS SPACING SCALE

```css
--xs: 4px      /* Small gaps */
--sm: 8px      /* Form input padding */
--md: 16px     /* Component padding */
--lg: 24px     /* Section padding */
--xl: 32px     /* Major sections */
--xxl: 48px    /* Page margins */
```

---

## GIT WORKFLOW

```bash
# Create feature branch
git checkout -b feature/feature-name

# Work and commit
git add .
git commit -m "feat: description (reference any issue)"

# Push to remote
git push origin feature/feature-name

# Create Pull Request
# → Review → Merge to main

# Update local
git checkout main
git pull origin main
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `test:` Tests
- `chore:` Build/config

---

## TESTING COMMANDS

```bash
# Run all tests
npm test

# Run specific file
npm test -- path/to/file.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Integration tests
npm run test:integration
```

**Test Structure:**
```javascript
describe('Feature Name', () => {
  beforeAll(async () => { /* setup */ });
  beforeEach(() => { /* each test setup */ });
  
  test('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

---

## COMMON TERMINAL COMMANDS

```bash
# Start development server
npm run dev

# Start production server
npm start

# Database migration
npm run migrate:up
npm run migrate:down

# Seed database
npm run seed

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Docker commands
docker-compose up
docker-compose down
docker-compose logs backend
```

---

## AUTHENTICATION FLOW

**Department Login:**
```javascript
POST /api/department/login
{
  "username": "hr_user1",
  "password": "password123"
}

// Returns:
{
  "session_id": "abc123xyz789",
  "expires_at": "2026-03-20T14:30:00Z"
}

// Use in requests:
headers: {
  'X-Session-ID': 'abc123xyz789'
}
```

**Session Management:**
- Timeout: 4 hours of inactivity
- Warning: 5 min before expiry
- Renewal: Auto-refresh on activity (or explicit request)

---

## DATABASE QUERY PATTERNS

**Get submissions for department with answers:**
```sql
SELECT 
  s.*,
  a.text as answer_text,
  a.answered_date
FROM submissions s
LEFT JOIN answers a ON s.id = a.submission_id
WHERE s.department_id = $1
  AND s.status = 'Answered'
ORDER BY s.submission_date DESC;
```

**Get red flags (pending >14 days):**
```sql
SELECT 
  department_id,
  COUNT(*) as pending_count,
  MIN(submission_date) as oldest_date,
  EXTRACT(DAY FROM NOW() - MIN(submission_date)) as days_pending
FROM submissions
WHERE status = 'Pending'
  AND submission_date < NOW() - INTERVAL '14 days'
GROUP BY department_id;
```

**Calculate helpfulness by department:**
```sql
SELECT 
  d.name,
  COUNT(CASE WHEN hf.is_helpful = true THEN 1 END)::float / 
  COUNT(*) * 100 as helpful_percentage
FROM helpfulness_feedback hf
JOIN answers a ON hf.answer_id = a.id
JOIN departments d ON a.department_id = d.id
GROUP BY d.name;
```

---

## COMMON BUGS & FIXES

**Bug:** CORS errors
**Fix:** Check `CORS_ORIGIN` env var, verify headers, use middleware:
```javascript
app.use(cors({ origin: process.env.CORS_ORIGIN }));
```

**Bug:** Session expires unexpectedly
**Fix:** Check `SESSION_TIMEOUT` value, ensure last activity timestamp updates, implement refresh tokens

**Bug:** Sentiment always "Neutral"
**Fix:** Verify TextBlob installation, check sentiment service logs, test with known positive/negative text

**Bug:** Database connection fails
**Fix:** Verify DB is running, check credentials in `.env`, ensure DB_HOST is correct (localhost vs container name)

**Bug:** Frontend API returns 401
**Fix:** Check session token is stored in localStorage, verify header name matches (`X-Session-ID`), check token isn't expired

---

## USEFUL EXTENSIONS & TOOLS

**VS Code Extensions:**
- REST Client (for API testing)
- Thunder Client
- PostgreSQL
- GitLens
- Prettier (code formatter)
- ESLint

**Browser DevTools:**
- Network tab (API calls)
- Application/Storage (localStorage, cookies)
- Console (errors)
- Elements (inspect HTML)

**Database Tools:**
- pgAdmin (PostgreSQL UI)
- DBeaver (SQL IDE)
- psql (command line)

**API Testing:**
- Postman
- Insomnia
- curl/HTTPie

---

## PERFORMANCE TIPS

**Backend:**
- Use database indexes on frequently queried columns
- Implement pagination (default 10-50 items)
- Cache sentiment analysis results
- Use batch operations for bulk updates
- Monitor query performance with EXPLAIN ANALYZE

**Frontend:**
- Lazy load images
- Minimize CSS/JS bundles
- Defer non-critical scripts
- Cache API responses where appropriate
- Use CSS Grid/Flexbox efficiently

**Database:**
- Index on: `department_id`, `status`, `submission_date`
- Use CLUSTER for frequently sorted columns
- Archive very old data (yearly)
- Vacuum and analyze regularly

---

## SECURITY CHECKLIST

- [ ] HTTPS enforced in production
- [ ] Passwords hashed with Bcrypt (cost: 12+)
- [ ] Input validation on all endpoints
- [ ] Parameterized queries (prevent SQL injection)
- [ ] Output sanitization (prevent XSS)
- [ ] CORS configured correctly
- [ ] Rate limiting on public endpoints
- [ ] CSRF tokens if using cookies
- [ ] Secrets never committed to git
- [ ] Security headers set (HSTS, CSP, X-Frame-Options)
- [ ] Dependencies kept up to date
- [ ] Logging configured (not logging passwords)

---

## DEPLOYMENT CHECKLIST

- [ ] `.env` file configured for production
- [ ] Database backups enabled
- [ ] HTTPS certificate installed
- [ ] Static files CDN configured (optional)
- [ ] Email service set up (optional)
- [ ] Monitoring & alerting enabled
- [ ] Log aggregation configured
- [ ] Database migrations run
- [ ] Tests passing locally
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Rollback plan documented

---

## USEFUL LINKS

**Documentation:**
- PostgreSQL: https://www.postgresql.org/docs/
- Express.js: https://expressjs.com/
- Node.js: https://nodejs.org/docs/
- CSS: https://developer.mozilla.org/en-US/docs/Web/CSS/

**Tools:**
- Regex Tester: https://regex101.com/
- JSON Formatter: https://jsonformatter.org/
- Diff Checker: https://www.diffchecker.com/
- Color Picker: https://htmlcolorcodes.com/

---

## EMERGENCY CONTACTS / ESCALATION

**Database Down:** 
1. Check DB logs: `docker logs suggestion-box-db`
2. Verify connectivity: `psql -U admin -d suggestion_box`
3. Restart if needed: `docker restart suggestion-box-db`

**API Errors:**
1. Check server logs: `npm start` with logging enabled
2. Verify environment variables
3. Check database connection
4. Review recent git changes

**Frontend Issues:**
1. Clear browser cache (Ctrl+Shift+Del)
2. Check network tab for API errors
3. Verify API_URL in .env
4. Check console for JS errors

---

**Last Updated:** March 22, 2026  
**Print & Keep Handy!** 👍
