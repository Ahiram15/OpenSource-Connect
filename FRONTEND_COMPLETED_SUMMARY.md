# Frontend Completed Components - OpenSource Connect

This document outlines all setup steps and completed frontend screens built according to the **Frontend-First Strategy** for **OpenSource Connect**.

---

## 🛠️ 1. Environment & Project Setup

- **React + Vite App Scaffolded:** Initialized in the `client/` directory.
- **Dependencies Installed:**
  - `react-router-dom` (Single Page Application Routing)
  - `recharts` (Skill Proficiency Bar Charts)
  - `lucide-react` (Modern UI Icons)
- **Design System Configured:** Styled in `client/src/index.css` with CSS `:root` design variables (Dark Mode `#07090e`, Glassmorphic card backplates, glowing borders, and Plus Jakarta Sans typography).

---

## 👥 2. Task & Page Summary

### 👤 Partner 1 UI Components
1. **Login Screen (`client/src/pages/Login.jsx`)**
   - Splash screen with "Log in with GitHub" button.
2. **Dashboard (`client/src/pages/Dashboard.jsx`)**
   - Summary blocks: `Total Contributions` counter & `Saved Issues` counter.
   - Dummy language skill bar chart powered by Recharts.
3. **Profile Settings (`client/src/pages/Profile.jsx`)**
   - Technical interests checklist (`React`, `Node`, `Python`, `MongoDB`, `Express`, `JavaScript`, `TypeScript`).
   - Experience level selector (`Beginner`, `Intermediate`, `Advanced`).

### 🔍 Partner 2 UI Components
1. **Issue Feed (`client/src/pages/IssueList.jsx`)**
   - List of issue cards displaying repo name, tags, stars, and a **green circular Match Score badge** (e.g., `92%`).
   - **Sidebar Search & Filters:** Filter bar by language (`React`, `Node`, `Python`) and difficulty level (`good first issue`, `Intermediate`).
2. **Issue Detail & Roadmap (`client/src/pages/IssueDetail.jsx`)**
   - Full issue explanation.
   - **AI Match Rationale** & **Identified Knowledge Gaps**.
   - **Interactive Step-by-Step Learning Roadmap Checklist:** Checkboxes that toggle step completion states in real time.

---

## 🗺️ 3. App Routing (`client/src/App.jsx`)

All 5 pages are connected in `client/src/App.jsx` with a navigation header:

- `/` ➔ `Login.jsx`
- `/dashboard` ➔ `Dashboard.jsx`
- `/profile` ➔ `Profile.jsx`
- `/issues` ➔ `IssueList.jsx`
- `/issues/:id` ➔ `IssueDetail.jsx`

---

## 🌿 4. Git Push Commands

Save and push all frontend changes to your repository:

```bash
git add .
git commit -m "feat: Build complete Frontend UI for Partner 1 and Partner 2"
git push origin feature/frontend-user-space
```
