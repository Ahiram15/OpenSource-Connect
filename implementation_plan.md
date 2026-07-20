# OpenSource Connect - Implementation Plan & Git Guide

## 📌 Project Overview
OpenSource Connect is an AI-powered web platform that matches developers with suitable open-source GitHub issues based on their profile, skills, and interests. It generates match scores, explanation summaries, and step-by-step learning roadmaps.

This plan uses a **Frontend-First strategy**: both partners build and test all frontend React screens first using mock data, merge them into `main`, and then move to the `server/` directory to build the backend APIs.

---

## 🛠️ Technology Stack

### Frontend Client (`/client`)
- **Framework:** React.js (Vite) - Single-page UI application
- **Styling:** Tailwind CSS - Modern, dark theme with glassmorphism
- **Analytics:** Recharts - Interactive language proficiency charts

### Backend Server (`/server`)
- **Framework:** Node.js & Express.js - Server application & REST API
- **Database:** MongoDB - User profiles, skills, and saved issues

### External APIs
- **GitHub API:** OAuth authentication and open issue fetching
- **Google Gemini API:** Match score calculations and AI learning roadmaps

---

## 🤖 Antigravity AI Prompting Rules
1. **Explain the specific file:** Tell Antigravity the exact file path (e.g., `"Create a dashboard screen in client/src/pages/Dashboard.jsx"`).
2. **Provide context:** Always mention that you are using **React** and **Tailwind CSS**.
3. **Be descriptive:** Specify UI elements, colors, and layouts (e.g., *"dark theme with a glass-like header card and purple buttons"*).

---

## 🌿 Git & GitHub Step-by-Step Guide

### Step 1: Initial Tool Setup (Do once)
- **Install Git:** Download and install from [git-scm.com](https://git-scm.com).
- **Configure Identity:**
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

### Step 2: Repository Setup & Cloning
- **Create Repository:** Create a new repository named `opensource-connect` on GitHub.
- **Invite Partner:** Add your partner under `Settings ➜ Collaborators`.
- **Clone Locally:**
  ```bash
  git clone https://github.com/Ahiram15/OpenSource-Connect.git
  ```

### Step 3: Feature Branching
Never edit `main` directly. Work in designated feature branches:
- **Partner 1 Branch:** `git checkout -b feature/frontend-user-space`
- **Partner 2 Branch:** `git checkout -b feature/frontend-issues`

### Step 4: Daily Save & Push
```bash
# Check changed files
git status

# Stage all changes
git add .

# Commit save locally
git commit -m "feat: Add buttons and styles to login screen"

# Push to GitHub
git push origin feature/your-branch-name
```

### Step 5: Pull Request (PR) & Merging
1. Go to your repository on GitHub.
2. Click **Compare & pull request** next to your branch.
3. Add a description and click **Create pull request**.
4. Partner approves and clicks **Merge pull request**.
5. Update your local main branch:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/next-feature-branch
   ```

### Step 6: Resolving Merge Conflicts
If both partners edit the same line:
1. Open the file in VS Code.
2. Select **Accept Current Change**, **Accept Incoming Change**, or **Accept Both**.
3. Save, commit, and push:
   ```bash
   git add .
   git commit -m "chore: Resolve merge conflicts"
   git push origin feature/your-branch-name
   ```

---

## 🏁 Phase 1: Frontend Development First

### Step 0: Initial Route Setup (Together)
Before creating feature branches, create empty placeholder files and set up routes in `client/src/App.jsx`:
- `client/src/pages/Login.jsx`
- `client/src/pages/Dashboard.jsx`
- `client/src/pages/IssueList.jsx`
- `client/src/pages/IssueDetail.jsx`
- `client/src/pages/Profile.jsx`

### Task Division

#### 👤 Partner 1: Landing, Dashboard & Profile UI
- **Login Screen (`client/src/pages/Login.jsx`):** Splash screen with "Log in with GitHub" button.
- **Dashboard (`client/src/pages/Dashboard.jsx`):** Summary blocks (Total Contributions, Saved Issues) and dummy skill charts.
- **Profile Settings (`client/src/pages/Profile.jsx`):** Checklist for technical interests (React, Node, Python) and experience levels.

#### 🔍 Partner 2: Recommendations, Search & Roadmap UI
- **Issue Feed (`client/src/pages/IssueList.jsx`):** List of issue cards displaying repo name, tags, and green circular Match Score (e.g., `92%`).
- **Sidebar Search & Filters:** Filter bar by language and difficulty level (`good first issue`).
- **Issue Detail & Roadmap (`client/src/pages/IssueDetail.jsx`):** Full issue explanation, AI match rationale, and interactive step-by-step Learning Roadmap checklist.

---

## ⚙️ Phase 2: Backend Development

Once frontend screens are complete and merged into `main`, both partners move to the `server/` directory.

#### 🛡️ Partner 1: Express Server & Auth API
- Express server boilerplate setup in `server/src/index.js`.
- GitHub OAuth endpoints for user authentication.
- User profile database schema in MongoDB (Mongoose).

#### 🧠 Partner 2: GitHub Ingestion & Gemini AI
- GitHub API service to fetch open issues.
- Google Gemini API integration (sends user skills + issue body to calculate match score, gap explanations, and roadmap).
- REST API routes (`GET /api/recommendations`).

---

## 📄 Frontend/Backend API Contract (Mock Data)

Use this mock JSON structure in React to develop and test UI components before backend integration:

```json
[
  {
    "id": "issue-101",
    "title": "Fix React routing leak on component unmount",
    "repository": "facebook/react-router",
    "stars": 49200,
    "labels": ["bug", "good first issue"],
    "matchScore": 92,
    "explanation": "Matches your profile history because you have React experience.",
    "difficulty": "Intermediate",
    "estimatedTime": "2-3 hours",
    "knowledgeGaps": [
      "React Router transitions",
      "Effect unmount cleanup hooks"
    ],
    "roadmap": [
      {
        "step": 1,
        "task": "Read React Router documentation on route transitions",
        "completed": false
      },
      {
        "step": 2,
        "task": "Locate the memory leak event listener inside code",
        "completed": false
      },
      {
        "step": 3,
        "task": "Add a return function inside useEffect to remove listener",
        "completed": false
      }
    ]
  }
]
```

---

## 🎨 Design System & Theme Colors

Add these CSS variables to `client/src/index.css` for consistent styling:

```css
:root {
  /* Theme Color Palette */
  --bg-dark: #0b0f19;       /* Slate-950: Dark background */
  --surface: #1e293b;       /* Slate-800: Card container background */
  --text-main: #f8fafc;     /* Slate-50: Bright heading text */
  --text-muted: #94a3b8;    /* Slate-400: Subtitle / description text */

  /* Accent Colors */
  --primary: #6366f1;       /* Indigo-500: Primary buttons */
  --success: #10b981;       /* Emerald-500: High Match score */
  --warning: #f59e0b;       /* Amber-500: Medium Match score */

  /* Glassmorphism Panel Styles */
  --glass-bg: rgba(15, 23, 42, 0.45);
  --glass-border: rgba(255, 255, 255, 0.08);
}
```

---

## 📈 Team Guidelines & Daily Workflow
1. **Work in designated files:** Prevents Git conflicts.
2. **Pull `main` daily:**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-branch-name
   git merge main
   ```
3. **Update `task.md`:** Mark `[/]` for in-progress and `[x]` for completed tasks.
4. **5-Minute Daily Sync:** Align on progress, daily targets, and any blockers.
