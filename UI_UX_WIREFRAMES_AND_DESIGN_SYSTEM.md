# UI/UX Wireframe Specifications & Visual Design Guidelines

**Project:** Anonymous Suggestion Box Platform  
**Document:** Wireframes & Design System  
**Version:** 1.0

---

## TABLE OF CONTENTS

1. [Design System](#design-system)
2. [Public User Interface Wireframes](#public-user-interface-wireframes)
3. [Department Interface Wireframes](#department-interface-wireframes)
4. [Admin Interface Wireframes](#admin-interface-wireframes)
5. [Component Library](#component-library)
6. [Interaction Patterns](#interaction-patterns)

---

## DESIGN SYSTEM

### Color Palette

**Primary Colors**
```
Primary Brand Color: #2563eb (Bright Blue)
  Usage: CTA buttons, active states, links

Secondary Color: #10b981 (Green)
  Usage: Success states, helpful/positive feedback

Alert Color: #ef4444 (Red)
  Usage: Errors, complaints, red flags

Warning Color: #f59e0b (Amber)
  Usage: Pending state, warnings

Neutral: #6b7280 (Gray)
  Usage: Secondary text, disabled states

Background: #ffffff (White)
  Usage: Page background

Light Gray: #f3f4f6 (Very Light Gray)
  Usage: Cards, sections, containers

Dark Text: #111827 (Almost Black)
  Usage: Primary text
```

**Category Badge Colors**
```
Question: #3b82f6 (Blue)
Complaint: #ef4444 (Red)
Suggestion: #10b981 (Green)
General: #8b5cf6 (Purple)
```

---

### Typography

**Font Family:** System stack (for web performance)
```
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

**Sizes & Hierarchy**
```
Display/Logo:     32px, Weight: 700, Line-height: 1.2
Heading 1:        28px, Weight: 700, Line-height: 1.3
Heading 2:        24px, Weight: 600, Line-height: 1.3
Heading 3:        20px, Weight: 600, Line-height: 1.4
Heading 4:        18px, Weight: 600, Line-height: 1.4
Body Large:       16px, Weight: 400, Line-height: 1.6
Body:             14px, Weight: 400, Line-height: 1.6
Small/Caption:    12px, Weight: 400, Line-height: 1.5
Metadata:         12px, Weight: 500, Line-height: 1.4, Color: #6b7280
```

---

### Spacing Scale

```
xs:  4px   (small gaps)
sm:  8px   (form inputs padding)
md: 16px   (component padding)
lg: 24px   (section padding)
xl: 32px   (major sections)
xxl: 48px  (page margins)
```

---

### Border Radius

```
None:      0px   (sharp edges)
Small:     4px   (buttons, inputs)
Medium:    8px   (cards, modals)
Large:    12px   (large containers)
Full:    9999px  (badges, avatars)
```

---

### Shadows

```
Small Shadow:   0 1px 2px 0 rgba(0,0,0,0.05)
Medium Shadow:  0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)
Large Shadow:   0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)
XL Shadow:      0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)
```

---

### Breakpoints (Responsive Design)

```
Mobile:     320px - 640px  (xs: 320px)
Tablet:     641px - 1024px (sm: 640px, md: 768px)
Desktop:   1025px - 1920px (lg: 1024px, xl: 1280px)
Large:    1921px+           (2xl: 1536px)
```

---

## PUBLIC USER INTERFACE WIREFRAMES

### 1. Home/Landing Page Layout

```
┌──────────────────────────────────────────────────────────┐
│                    HEADER/NAVBAR                          │
│  Brand Logo   [Home] [View Feedback] [About] [Contact]   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                     HERO SECTION                          │
│                                                          │
│         Welcome to Our Feedback Platform                │
│                                                          │
│    Share your feedback anonymously and confidentially   │
│    to help us improve our university services          │
│                                                          │
│              [Get Started Button]                       │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  How It Works                                            │
│                                                          │
│  1. Submit Feedback    2. We Review    3. Get Answer   │
│  [Icons]               [Icons]         [Icons]          │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Recent Answers Preview (3 items)                        │
│                                                          │
│  [Card] [Card] [Card]                                  │
│                                                          │
│  [View All Answers →]                                  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                      FOOTER                              │
│  © 2026 University. Privacy | Terms | Contact           │
└──────────────────────────────────────────────────────────┘
```

---

### 2. Submission Form Page - Two Column Layout

**Desktop View (1024px+)**
```
┌─────────────────────────────────────────────────────────────┐
│              HEADER / BREADCRUMB                            │
│              Home > Submit Feedback                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────────┐
│                      │                                      │
│   LEFT COLUMN        │     RIGHT COLUMN                    │
│   (40-45% width)     │     (55-60% width)                  │
│                      │                                      │
│  ┌────────────────┐  │  ┌────────────────────────────────┐ │
│  │ SUBMIT FORM    │  │  │  ALREADY ANSWERED              │ │
│  │                │  │  │  Browse Resolved Issues        │ │
│  │ Share Your     │  │  │                                │ │
│  │ Feedback       │  │  │  Department Tags:              │ │
│  │                │  │  │  ✓ Human Resources             │ │
│  │ [Form Fields]  │  │  │  ✓ IT Services                 │ │
│  │                │  │  │  ✓ Facilities                 │ │
│  │                │  │  │  ✓ Finance                    │ │
│  │ [Submit Button]│  │  │  ✓ General                    │ │
│  │                │  │  │                                │ │
│  └────────────────┘  │  │  Last Updated: 2 hours ago    │ │
│                      │  └────────────────────────────────┘ │
│                      │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

**Mobile View (320px - 640px)**
```
┌──────────────────────────────────┐
│      HEADER / BREADCRUMB         │
│      Home > Submit Feedback      │
├──────────────────────────────────┤
│                                  │
│      SUBMIT FORM                 │
│                                  │
│      Share Your Feedback         │
│                                  │
│      [Form Fields]               │
│      [Submit Button]             │
│                                  │
├──────────────────────────────────┤
│                                  │
│      ALREADY ANSWERED            │
│      Browse Resolved Issues      │
│                                  │
│      Department Tags:            │
│      [Full width list]           │
│                                  │
│      [More departments...]       │
│                                  │
└──────────────────────────────────┘
```

---

### 3. Submission Form - Component Detail

**Form Field Specifications**

**a) Name: Department Tag Dropdown**
```
┌─────────────────────────────────────────┐
│ Select a Department *                  │ ▼
│─────────────────────────────────────────│
│ ✓ Human Resources                       │
│   IT Services                           │
│   Facilities                            │
│   Finance                               │
│   General                               │
└─────────────────────────────────────────┘

Attributes:
  - Label positioned above (inside label tag)
  - Red asterisk (*) for required
  - Padding: 12px 16px
  - Border: 1px solid #e5e7eb (light gray)
  - Border-radius: 4px
  - Font-size: 14px
  - Focus state: Blue outline (3px border #2563eb)
  - Required validation: Cannot submit without selection
```

**b) Name: Category Radio Buttons**
```
Feedback Type *

○ Question
○ Complaint
○ Suggestion

Attributes:
  - Label above
  - Red asterisk (*)
  - Vertical stack
  - Spacing between options: 12px
  - Required: At least one selected
  - Radio button size: 20px diameter
  - Text color: #111827
```

**c) Name: Feedback Text Area**
```
Your Feedback *

┌─────────────────────────────────────────┐
│ Please share your feedback, suggestion  │
│ or question...                          │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘

Character count: 0 / 5000

Attributes:
  - Label above
  - Red asterisk (*)
  - Min height: 200px
  - Max-height: 400px with vertical scroll
  - Padding: 12px 16px
  - Font-size: 14px
  - Border: 1px solid #e5e7eb
  - Border-radius: 4px
  - Focus: Blue outline
  - Real-time character counter below
  - Font-family: monospace for better readability
```

**d) Name: Submit & Reset Buttons**
```
┌──────────────────┐  ┌──────────────────┐
│  Submit Feedback │  │      Clear       │
└──────────────────┘  └──────────────────┘

Button States:

Normal:
  - Background: #2563eb (blue)
  - Text: White
  - Padding: 12px 24px
  - Border-radius: 4px
  - Font-weight: 600
  - Cursor: pointer
  - Font-size: 14px

Hover:
  - Background: #1d4ed8 (darker blue)

Active/Click:
  - Transform: scale(0.98)
  - Background: #1e40af (even darker)

Disabled (if form incomplete):
  - Background: #d1d5db (light gray)
  - Text: #9ca3af (dark gray)
  - Cursor: not-allowed
  - Opacity: 0.6
```

---

### 4. Submission Confirmation Modal

```
┌────────────────────────────────────────────────┐
│  ${center on screen with backdrop}             │
│  ┌──────────────────────────────────────────┐  │
│  │ ✓                                        │  │
│  │                                          │  │
│  │  Thank You!                              │  │
│  │                                          │  │
│  │  Thank you for your submission.          │  │
│  │  We will get back to you within 2 weeks.│  │
│  │                                          │  │
│  │         [OK, Got It]                     │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘

Modal Properties:
  - Background: White
  - Border-radius: 8px
  - Max-width: 500px
  - Padding: 40px
  - Shadow: Large shadow (XL)
  - Backdrop: Semi-transparent black (#000000 with 0.5 opacity)
  - Animation: Fade in 0.3s ease-out

Checkmark Icon:
  - Color: #10b981 (green)
  - Size: 64px
  - Margin-bottom: 20px

Title:
  - Font-size: 28px
  - Font-weight: 700
  - Margin-bottom: 16px
  - Color: #111827

Message:
  - Font-size: 16px
  - Line-height: 1.6
  - Color: #374151 (dark gray)
  - Margin-bottom: 24px
  - Text-align: center

Button:
  - Style: Primary blue button
  - On click: Close modal, reset form
```

---

### 5. "Already Answered" Tag Display

**Desktop Layout**
```
Section Title:
┌─────────────────────────────────────┐
│ Already Answered                    │
│ Browse previously answered questions│
└─────────────────────────────────────┘

Department Tags (Horizontal):
┌──────────┬──────────┬──────────┬──────────┐
│ Human    │   IT     │Facilities│ Finance  │
│Resources │ Services │          │          │
└──────────┴──────────┴──────────┴──────────┘

[General] [Show More...]

Tag Styling:
  - Display: Inline pill/badge
  - Padding: 8px 16px
  - Border-radius: 20px (full: 9999px for pill shape)
  - Background: Light gray #f3f4f6
  - Text: Dark #111827
  - Border: 1px solid #e5e7eb
  - Font-size: 14px
  - Font-weight: 500
  - Margin: 8px 8px 8px 0
  - Cursor: pointer

Hover State:
  - Background: #e5e7eb (slightly darker gray)
  - Border: 1px solid #d1d5db
  - Transform: translateY(-2px)
  - Box-shadow: 0 4px 6px rgba(0,0,0,0.1)

Active State (selected tag):
  - Background: #2563eb (blue)
  - Text: White
  - Border: 1px solid #1d4ed8
```

---

### 6. Tag Page (`/tag/{department}`) Layout

```
┌───────────────────────────────────────────────────────┐
│  ← Back to Home     [Department Name]                │
├───────────────────────────────────────────────────────┤
│                                                        │
│  Results for [Department Name]                        │
│  Showing 12 answered questions                        │
│                                                        │
│  [Filters/Sort]  [Search]  [Sort by newest ▼]        │
│                                                        │
├───────────────────────────────────────────────────────┤
│                                                        │
│  ┌───────────────────────────────────────────────┐   │
│  │ SUBMISSION 1                                  │   │
│  │                                               │   │
│  │ Original Question:                            │   │
│  │                                               │   │
│  │ "Where can I find information about          │   │
│  │  retirement benefits?"                       │   │
│  │                                               │   │
│  │ Submitted: 2 weeks ago                        │   │
│  │ Category: [Question Badge - Blue]             │   │
│  │                                               │   │
│  │ ─────────────────────────────────────────     │   │
│  │                                               │   │
│  │ ANSWER FROM HUMAN RESOURCES:                  │   │
│  │                                               │   │
│  │ "Retirement information is available on       │   │
│  │  the HR Portal. Visit hr.university.edu       │   │
│  │  and navigate to Benefits > Retirement."      │   │
│  │                                               │   │
│  │ ─────────────────────────────────────────     │   │
│  │                                               │   │
│  │ Was this answer helpful?                      │   │
│  │ [Yes Button] [No Button]                      │   │
│  │                                               │   │
│  │ [Thank you message appears after click]      │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│                                                        │
│  ┌───────────────────────────────────────────────┐   │
│  │ SUBMISSION 2                                  │   │
│  │ ... [same structure]                          │   │
│  └───────────────────────────────────────────────┘   │
│                                                        │
│  [Pagination: 1 2 3 4 ... Next]                      │
│                                                        │
└───────────────────────────────────────────────────────┘
```

**Post Card Styling**
```
Container:
  - Background: White
  - Border: 1px solid #e5e7eb
  - Border-radius: 8px
  - Padding: 24px
  - Margin-bottom: 24px
  - Shadow: Small shadow

Submission Box:
  - Background: #f9fafb (very light gray)
  - Padding: 16px
  - Border-left: 4px solid #3b82f6 (blue accent)
  - Border-radius: 4px
  - Margin-bottom: 16px

Metadata Row:
  - Font-size: 12px
  - Color: #6b7280 (gray)
  - Spacing: 16px between items
  - Contains: Date, Category badge

Answer Box:
  - Background: #ffffff
  - Padding: 16px
  - Border-left: 4px solid #10b981 (green accent)
  - Border-radius: 4px
  - Margin-bottom: 16px

Helpfulness Section:
  - Padding-top: 16px
  - Border-top: 1px solid #e5e7eb
  - Display: Flex gap 12px
  
  Button styling (Yes/No):
    - Size: Small/medium
    - Border: 1px solid #d1d5db
    - Background: White
    - Text: #111827
    - Padding: 8px 16px
    - Border-radius: 4px
    - Cursor: pointer
    
    Hover:
      - Background: #f3f4f6
      - Border: 1px solid #9ca3af
    
    Selected:
      - Background: #2563eb (blue)
      - Text: White
      - Border: 1px solid #1d4ed8
```

---

## DEPARTMENT INTERFACE WIREFRAMES

### 1. Department Login Page

```
┌──────────────────────────────────────────────────┐
│                                                  │
│         UNIVERSITY LOGO / BRAND                 │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│      ┌──────────────────────────────────┐       │
│      │                                  │       │
│      │   Department Staff Login         │       │
│      │                                  │       │
│      │   ┌────────────────────────────┐ │       │
│      │   │ Username                   │ │       │
│      │   │ [___________________]      │ │       │
│      │   └────────────────────────────┘ │       │
│      │                                  │       │
│      │   ┌────────────────────────────┐ │       │
│      │   │ Password                   │ │       │
│      │   │ [___________________]      │ │       │
│      │   │ ☑ Show Password            │ │       │
│      │   └────────────────────────────┘ │       │
│      │                                  │       │
│      │   [     Login     ]              │       │
│      │                                  │       │
│      │   [Error message if invalid]    │       │
│      │                                  │       │
│      │   Forgot credentials?           │       │
│      │   [Contact Admin ↗]             │       │
│      │                                  │       │
│      └──────────────────────────────────┘       │
│                                                  │
│                 © 2026 University                │
│                                                  │
└──────────────────────────────────────────────────┘

Form Width: Max 400px, centered
Background: Light gradient or solid color
Input fields: Standard text inputs, 40px height
Login button: Full width, primary color
```

---

### 2. Department Dashboard

```
┌──────────────────────────────────────────────────────┐
│  [≡ Menu] Department Dashboard  [Profile] [Logout]  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  HEADER                                              │
│  Human Resources Department                          │
│  Logged in as: Sarah Johnson                         │
│  Session expires in: 3 hours 45 minutes ⟲      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                                                      │
│  FILTERS & SEARCH                                   │
│                                                      │
│  [Status ▼] [Category ▼] [Sort ▼]                   │
│                                                      │
│  Search submissions... [🔍]                         │
│                                                      │
│  Showing: 3 of 15 pending submissions                │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ STATUS: PENDING  [Orange Badge]              │  │
│  │                                              │  │
│  │ Original Submission:                         │  │
│  │ "[Quote: When will the new payroll system   │  │
│  │ be implemented?]"                           │  │
│  │                                              │  │
│  │ Category: Question  |  Submitted: 5 days   │  │
│  │ Days Pending: 5 days                         │  │
│  │                                              │  │
│  │ Current Status: Not Yet Answered             │  │
│  │                                              │  │
│  │ [Answer & Publish] [View] [Hide]             │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ STATUS: PENDING  [Orange Badge]              │  │
│  │ [Similar structure, different content]      │  │
│  │ [Answer & Publish] [View] [Hide]             │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ STATUS: ANSWERED  [Green Badge]              │  │
│  │                                              │  │
│  │ Original Submission: "[...]"                 │  │
│  │                                              │  │
│  │ Existing Answer: "[Department's response]"  │  │
│  │ Answered on: March 18                        │  │
│  │ Published: Yes                               │  │
│  │                                              │  │
│  │ [Edit Answer] [View] [Unhide]                │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  [Pagination: 1 2 3 ... Next]                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Submission Card - Detailed States**

**Pending State:**
```
┌────────────────────────────────────────┐
│ 🟠 PENDING                             │
│                                        │
│ QUESTION: [Submitted text in quote]   │
│                                        │
│ Category: Question                     │
│ Submitted: March 15 at 10:30 AM       │
│ Days Pending: 5 days                  │
│                                        │
│ Status: Awaiting Response              │
│                                        │
│ [Answer & Publish] [View] [Hide]      │
└────────────────────────────────────────┘
```

**Answered/Published State:**
```
┌────────────────────────────────────────┐
│ 🟢 ANSWERED                            │
│                                        │
│ QUESTION: [Submitted text]            │
│                                        │
│ Category: Question | Submitted: Mar 15│
│                                        │
│ ─────────────────────────────────────  │
│                                        │
│ PUBLISHED ANSWER:                      │
│ "[Department's response text...]"     │
│                                        │
│ Answered: March 18 at 2:45 PM         │
│ Answered by: John Smith               │
│ Published: Yes ✓                       │
│                                        │
│ [Edit] [View on Site] [Hide]          │
└────────────────────────────────────────┘
```

**Hidden State:**
```
┌────────────────────────────────────────┐
│ 🟤 HIDDEN                              │
│                                        │
│ QUESTION: [Submitted text]            │
│                                        │
│ Category: Question | Submitted: Mar 12│
│                                        │
│ Status: Hidden from public view        │
│ Reason: Duplicate - Already addressed │
│                                        │
│ [View Details] [Unhide] [Delete Note] │
└────────────────────────────────────────┘
```

---

### 3. Answer & Publish Modal

```
┌─────────────────────────────────────────────────┐
│  ✕                    Answer Submission      ✕ │
├─────────────────────────────────────────────────┤
│                                                 │
│  Original Submission:                          │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ "When will the new payroll system be      │ │
│  │  implemented? Our current system is       │ │
│  │  causing issues with direct deposit."     │ │
│  │                                           │ │
│  │ Category: Question                        │ │
│  │ Submitted: March 15, 2026                 │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Your Response:                                │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ [Type your answer here...]                │ │
│  │                                           │ │
│  │ The new payroll system will be launched  │ │
│  │ on April 1st. We've sent detailed        │ │
│  │ information to all department heads.     │ │
│  │ If you have questions, contact the       │ │
│  │ Finance department.                      │ │
│  │                                           │ │
│  │                                           │ │
│  │ Character count: 234 / 2000              │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Signed By (Optional):                         │
│  ┌───────────────────────────────────────────┐ │
│  │ Human Resources Department                │ │
│  │ [or your name if preferred]              │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  [⚙ Formatting] [Preview]                     │
│                                                 │
│  [Cancel] [Save Draft] [Publish to Site]      │
│                                                 │
└─────────────────────────────────────────────────┘

Modal Properties:
  - Max-width: 700px
  - Centered on screen
  - Backdrop: Semi-transparent
  - Close button (X) in top-right
```

---

### 4. Hide Submission Modal

```
┌──────────────────────────────────────────────┐
│  ✕         Hide This Submission           ✕ │
├──────────────────────────────────────────────┤
│                                              │
│  Are you sure you want to hide this          │
│  submission?                                 │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ "When can we get better coffee in    │   │
│  │  the employee lounge?"                │   │
│  │                                      │   │
│  │ Category: Suggestion                 │   │
│  │ Submitted: March 20                  │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  What happens when you hide:                 │
│  ✓ Submission remains in your records       │
│  ✓ Won't appear on public site              │
│  ✓ Can be answered later if needed         │
│                                              │
│  Reason for Hiding (optional):               │
│  ┌──────────────────────────────────────┐   │
│  │ Duplicate / Already answered         │   │
│  │ Not related to our department        │   │
│  │ Inappropriate content                │   │
│  │ Other: [_____________]               │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Additional Notes:                           │
│  ┌──────────────────────────────────────┐   │
│  │ [Optional text field for context]    │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  [Cancel] [Don't Hide] [Confirm Hide]       │
│                                              │
└──────────────────────────────────────────────┘
```

---

## ADMIN INTERFACE WIREFRAMES

### 1. Admin Dashboard - Top Section

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                                        │
│  Logged in as: Dr. Patricia Williams | [Settings] [x]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CONTROLS & FILTERS                                    │
│                                                         │
│  Date Range:                                           │
│  [From: 03/01/2026 ▼] [To: 03/22/2026 ▼] [Apply]    │
│                                                         │
│  Filter by Department:                                 │
│  ☑ All  ☐ HR  ☐ IT Services  ☐ Facilities           │
│  ☐ Finance  ☐ General                                 │
│                                                         │
│  [⟲ Refresh Now]  Last updated: 2 minutes ago          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  KEY METRICS (Grid Layout)                             │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ TOTAL        │  │ PENDING      │                   │
│  │ SUBMISSIONS  │  │ SUBMISSIONS  │                   │
│  │              │  │              │                   │
│  │     427      │  │      18      │                   │
│  │              │  │              │                   │
│  │ ↓ 5 this wk │  │ ↑ 3 since wk │                   │
│  └──────────────┘  └──────────────┘                   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ PUBLISHED    │  │ HIDDEN       │                   │
│  │ ANSWERS      │  │ SUBMISSIONS  │                   │
│  │              │  │              │                   │
│  │     405      │  │       4      │                   │
│  │              │  │              │                   │
│  │ ↑ 12 this wk │  │ ↓ 1 this wk │                   │
│  └──────────────┘  └──────────────┘                   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ AVG RESPONSE │  │ SENTIMENT    │                   │
│  │ TIME         │  │ OVERALL      │                   │
│  │              │  │              │                   │
│  │   4.2 days   │  │  Positive    │                   │
│  │              │  │  (68%)       │                   │
│  └──────────────┘  └──────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Metric Card Styling**
```
Container:
  - Background: White or light gradient
  - Border: 1px solid #e5e7eb
  - Border-radius: 8px
  - Padding: 20px
  - Shadow: Small
  - Min-width: 180px
  - Grid: 2-4 columns depending on screen size

Large Number:
  - Font-size: 36px
  - Font-weight: 700
  - Color: Depends on metric:
    * Total: #2563eb (blue)
    * Pending: #f59e0b (amber/warning)
    * Answered: #10b981 (green)
    * Hidden: #6b7280 (gray)

Label:
  - Font-size: 12px
  - Font-weight: 600
  - Color: #6b7280
  - Text-transform: uppercase
  - Margin-bottom: 8px

Trend Indicator:
  - Font-size: 12px
  - Color: Depends on direction:
    * Up (positive): #10b981 (green) with ↑
    * Down (negative): #ef4444 (red) with ↓
    * Neutral: #6b7280 with →
```

---

### 2. Admin Dashboard - Charts Section

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ANSWERS PER DEPARTMENT (WEEKLY)                       │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 15 │                                               │ │
│  │ 12 │      ┌─────┐                                 │ │
│  │    │      │     │      ┌──────┐                  │ │
│  │  9 │  ┌───┤     ├──┬───┤      ├────┐             │ │
│  │    │  │   │     │  │   │      │    │             │ │
│  │  6 │  │   │     │  │   │      │    │  ┌──┐      │ │
│  │    │  │   │     │  │   │      │    │  │  │      │ │
│  │  3 │  │   │     │  │   │      │    │  │  │      │ │
│  │    │  │   │     │  │   │      │    │  │  │      │ │
│  │  0 └──┴───┴─────┴──┴───┴──────┴────┴──┴──┴──────│ │
│  │    HR   IT  Facilities Finance General           │ │
│  │                                                   │ │
│  │ [Legend: This week: 12, Last week: 8]           │ │
│  │                                                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SENTIMENT TREND (LAST 30 DAYS)                       │
│                                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 100% │                                             │ │
│  │      │                ╱─────────                  │ │
│  │  75% │            ╱───         ─────              │ │
│  │      │        ╱───     ─────────                 │ │
│  │  50% │    ╱───                                   │ │
│  │      │────                                       │ │
│  │  25% │                                           │ │
│  │      │                                           │ │
│  │   0% └────────────────────────────────────────────│ │
│  │      Mar 1      Mar 10      Mar 20      Mar 30   │ │
│  │      ─── Positive  ─── Neutral  ─── Negative    │ │
│  │      Positive: 68% | Neutral: 24% | Negative: 8%│ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Admin Dashboard - Red Flags Section

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ⚠️  RED FLAGS - DEPARTMENTS NEEDING ATTENTION         │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ HUMAN RESOURCES                                   │ │
│  │ ⚠️ 3 submissions unanswered for > 14 days         │ │
│  │                                                   │ │
│  │ • Submission from: March 1 (21 days pending)    │ │
│  │   "Employee benefits clarification needed"      │ │
│  │                                                   │ │
│  │ • Submission from: March 3 (19 days pending)    │ │
│  │   "Vacation policy for part-time staff"         │ │
│  │                                                   │ │
│  │ • Submission from: March 5 (17 days pending)    │ │
│  │   "What is the procedure for requesting..."     │ │
│  │                                                   │ │
│  │ [Contact Department] [View All] [Dismiss]        │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ FACILITIES                                        │ │
│  │ ⚠️ 1 submission unanswered for > 14 days          │ │
│  │                                                   │ │
│  │ • Submission from: March 8 (14 days pending)    │ │
│  │   "Building air conditioning not working..."    │ │
│  │                                                   │ │
│  │ [Contact Department] [Dismiss]                   │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Admin Dashboard - Engagement & Keywords

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ENGAGEMENT METRICS                                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Department  │ Answers │ Helpfulness │ Good │ Bad │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ HR          │   45    │     78%     │ 35  │ 10  │  │
│  │ IT Services │   52    │     82%     │ 43  │ 9   │  │
│  │ Facilities  │   38    │     71%     │ 27  │ 11  │  │
│  │ Finance     │   42    │     75%     │ 32  │ 10  │  │
│  │ General     │   28    │     68%     │ 19  │ 9   │  │
│  │ TOTAL       │  205    │     75%     │ 156 │ 49  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Trending Up: IT Services (↑5% this week)             │
│  Trending Down: General (↓3% this week)               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TOP KEYWORDS & THEMES                                │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │                parking                          │  │
│  │           software        salary               │  │
│  │       equipment    benefits   conference       │  │
│  │     deadline    remote work    supplies       │  │
│  │        communication  budget   training       │  │
│  │                                                  │  │
│  │ [parking: 23] [salary: 19] [software: 17]     │  │
│  │ [equipment: 15] [benefits: 14] [deadline: 13] │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Click any keyword to see related submissions          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 5. Admin Dashboard - Questions by Department

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  SUBMISSION VOLUME BY DEPARTMENT                       │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │ HR ████████████████░░░░░░░░░░░░░  65          │   │
│  │    Questions: 25 | Complaints: 30 | Suggestions:10│   │
│  │                                                │   │
│  │ IT Services ██████████████░░░░░░░░░░░░░░░░  52 │   │
│  │    Questions: 28 | Complaints: 12 | Suggestions:12│   │
│  │                                                │   │
│  │ Facilities ███████████░░░░░░░░░░░░░░░░░░  42   │   │
│  │    Questions: 18 | Complaints: 15 | Suggestions: 9│   │
│  │                                                │   │
│  │ Finance ██████████░░░░░░░░░░░░░░░░░░░░  40    │   │
│  │    Questions: 20 | Complaints: 12 | Suggestions: 8│   │
│  │                                                │   │
│  │ General ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  28  │   │
│  │    Questions: 12 | Complaints: 8 | Suggestions: 8 │   │
│  │                                                │   │
│  └────────────────────────────────────────────────┘   │
│                                                         │
│  [Category Legend] [View Details]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### 6. Admin Dashboard - Hidden Submissions Table

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  HIDDEN SUBMISSIONS (4 total)                          │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Date   │ Department │ Category │ Reason          │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ Mar 20 │ HR         │ Complaint│ Duplicate       │ │
│  │ Mar 18 │ IT Svcs    │ Question │ Not applicabl   │ │
│  │ Mar 15 │ Facilities │ Complain │ Addressed priv  │ │
│  │ Mar 12 │ General    │ Suggest  │ Outside scope   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [View Details] [Unhide] [Delete Reason Notes]        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## COMPONENT LIBRARY

### Buttons

**Primary Button**
```
Style: Fill
Color: #2563eb (blue)
Hover: #1d4ed8 (darker blue)
Active: #1e40af (even darker)
Disabled: #d1d5db (gray)
Text Color: White
Padding: 10px 20px (small), 12px 24px (medium), 14px 28px (large)
Border-radius: 4px
Font-weight: 600
Transition: 0.2s ease

HTML:
<button class="btn btn-primary">Click Me</button>
```

**Secondary Button**
```
Style: Outline
Color: #6b7280 (gray)
Border: 2px solid #6b7280
Hover: Background #f3f4f6, Border #4b5563
Text Color: #111827
Padding: 10px 20px (small), 12px 24px (medium), 14px 28px (large)
Border-radius: 4px
Font-weight: 600
```

**Danger Button (Hide/Delete actions)**
```
Style: Fill
Color: #ef4444 (red)
Hover: #dc2626 (darker red)
Text Color: White
Padding: 10px 20px
Border-radius: 4px
Font-weight: 600
```

**Flat/Ghost Button (Cancel)**
```
Style: No background, no border
Color: #2563eb (text color)
Hover: Background #f0f4ff with Border #2563eb
Text Color: #2563eb
Padding: 10px 20px
Border-radius: 4px
Font-weight: 600
```

---

### Form Inputs

**Text Input & Textarea**
```
Background: White
Border: 1px solid #e5e7eb
Border-radius: 4px
Padding: 10px 12px
Font-size: 14px
Font-family: inherit
Focus state: Border #2563eb (2px), Outline none
Placeholder color: #9ca3af

Error state:
  Border: 2px solid #ef4444
  Background: #fef2f2
  Help text color: #dc2626
```

**Select Dropdown**
```
Similar to text input
Appearance: standard (native browser)
Arrow color: #9ca3af
Focus: Blue border and outline
```

**Radio Buttons**
```
Size: 20px diameter
Default: Unchecked #d1d5db border
Selected: #2563eb fill
Hover: Slight shadow
Label spacing: 8px from label text
```

**Checkboxes**
```
Size: 16x16px
Default: #d1d5db border
Checked: #2563eb background with white checkmark
Hover: Background #e5e7eb
```

---

### Badges & Status Indicators

**Status Badges**
```
Pending: Background #fef3c7, Text #92400e, Border #fde68a
Answered: Background #dcfce7, Text #166534, Border #bbf7d0
Hidden: Background #f3f4f6, Text #4b5563, Border #d1d5db
```

**Category Badges**
```
Question: Background #dbeafe, Text #0c4a6e
Complaint: Background #fee2e2, Text #7c2d12
Suggestion: Background #dcfce7, Text #166534
```

---

### Modals

**Modal Container**
```
Background: White
Border-radius: 8px
Max-width: 500-700px (responsive)
Padding: 32-40px
Box-shadow: XL shadow
Position: Centered on screen (fixed positioning)
Z-index: 1000+
```

**Backdrop**
```
Background: rgba(0, 0, 0, 0.5)
Position: Fixed, full screen
Z-index: 999 (below modal)
```

**Animation**
```
Fade in: 0.3s ease-out
Fade out: 0.2s ease-in
Transform: scale(0.95) → scale(1)
```

---

### Pagination

```
Container: Flex, gap 8px
Button: 32x32px, center aligned
Style: Outline button, blue on active
Text: Arial, 14px
Active page: Filled blue background

Example:
[< Previous] [1] [2] [3] ... [10] [Next >]
```

---

## INTERACTION PATTERNS

### Form Submission Flow

```
1. User fills form
   ↓
2. Client-side validation
   - If invalid: Show inline errors
   - If valid: Continue to step 3
   ↓
3. User clicks Submit
   - Button shows loading state (disabled + spinner)
   ↓
4. API request sent to backend
   ↓
5. Backend validates & processes
   - If error: Return 400 with error message
   - If success: Return 201 with confirmation
   ↓
6a. If Error: Show error message, enable button
   ↓
6b. If Success: Show confirmation modal
   - Modal displays 2 seconds
   - Form resets
   - Focus returns to first input
```

---

### Login Flow

```
1. User visits /department/login
   ↓
2. User enters credentials
   ↓
3. User clicks Login
   - Button shows loading state
   ↓
4. Backend validates credentials
   - If invalid: Return 401
   - If valid: Return session token
   ↓
5a. If error: Show error message inline
   - Field border turns red
   - Error text displays below password field
   ↓
5b. If success: Store session token
   - Redirect to /department/dashboard
   - Session timeout timer starts
```

---

### Session Timeout Warning

```
When user has 5 minutes remaining:
- Warning modal appears
- Message: "Your session will expire in 5 minutes"
- Options: [Continue Session] [Logout]
- Continue: Refreshes session, modal closes
- Logout: Clears session, redirects to login
```

---

### Helpfulness Voting

```
1. User views answer
   ↓
2. User sees "Was this helpful?" buttons
   ↓
3. User clicks Yes or No
   - Button shows loading state (disabled)
   - Button color changes to indicate selection
   ↓
4. API request sent without authentication
   ↓
5a. If error: Show error message
   ↓
5b. If success: Show "Thank you for your feedback"
   - Message displays for 3 seconds
   - Buttons disabled
   - Message disappears
```

---

### Filter & Search Flow

```
1. User operates filter/search controls
   ↓
2. Changes apply immediately (or via Apply button)
   ↓
3. URL updates with query parameters
   ?status=pending&category=question&page=1
   ↓
4. List content updates with animation (fade)
   ↓
5. Pagination resets to page 1
   ↓
6. "No results" message if filters return nothing
```

---

**Design Document Version:** 1.0  
**Last Updated:** March 22, 2026  
**Ready for Frontend Development:** Yes
