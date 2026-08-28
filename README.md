# **OpenSource Connect**

> **Live Deployment:** [open-source-connect-five.vercel.app](https://open-source-connect-five.vercel.app/)

**OpenSource Connect** is an AI-powered web platform designed to simplify the process of contributing to open-source software. Many developers, especially beginners, struggle to find GitHub issues that match their technical skills and experience. Searching through thousands of repositories and understanding issue requirements can be time-consuming and discouraging.

This platform addresses that problem by intelligently recommending suitable GitHub issues based on a developer's profile, skills, interests, and previous contributions.

---

## 🚀 Key Features

* **GitHub Authentication (OAuth)**: Secure sign-in to parse your public profile and technical details.
* **GitHub Profile Analysis**: Analyzes your programming languages, repositories, and contribution history.
* **AI-Powered Recommendation Engine**: Generates tailored issue recommendations and custom **Match Scores (%)** using Google Gemini.
* **AI Learning Roadmaps**: Bridges knowledge gaps by generating step-by-step learning milestones and estimated completion times for recommended issues.
* **Dashboard Analytics**: Tracks your bookmarked issues, active pull requests, and ongoing contribution progress.
* **Advanced Filters**: Search and sort issues by language, difficulty levels (e.g., *good first issue*), and repository popularity.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Tailwind CSS, Recharts
* **Backend**: Node.js, Express.js
* **Database**: MongoDB
* **APIs**: GitHub REST & GraphQL API, Google Gemini API

---

## 💻 Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your system.

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/Ahiram15/OpenSource-Connect.git
cd OpenSource-Connect
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET=your_jwt_signing_secret
```

### 4. Running the Backend Server
Navigate to the `server` directory, install dependencies, and run the developer dev server:
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### 5. Running the Frontend Client
Navigate to the `client` directory, install dependencies, and start the Vite dev server:
```bash
cd client
npm install
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 🧠 System Architecture & High-Level Data Flow

When a developer interacts with **OpenSource Connect**, data flows through 5 distinct layers:

```
[User Browser] 
    │
    ▼ (1. Clicks "Log in with GitHub")
[GitHub OAuth 2.0] ──► Redirects back to Backend Callback
                            │
                            ▼ (2. Parses Repos & Languages)
                  [githubService.ts] ──► Computes language breakdown %
                            │
                            ▼ (3. Saves Profile)
                 [MongoDB Atlas Database]
                            │
                            ▼ (4. Fetches Issues + Calls Gemini AI)
                 [geminiService.ts] (gemini-2.0-flash)
                            │
                            ▼ (5. Returns Scored JSON to React UI)
                  [React Frontend Client]
```

---

## 🎨 Frontend Client Implementation (`/client`)

### A. Environment & Vite Configuration ([client/vite.config.js](file:///d:/Projects/OpenSource-Connect/client/vite.config.js))
- Vite configuration includes `server: { allowedHosts: true, host: true }` in `vite.config.js` to allow accepting HTTP requests from any hostname (local or tunneled via Cloudflare) while maintaining Hot Module Replacement (HMR).

### B. Type Definitions ([client/src/types/index.ts](file:///d:/Projects/OpenSource-Connect/client/src/types/index.ts))
- Standardized TypeScript interfaces for:
  - `UserProfile`: `githubId`, `username`, `avatarUrl`, `technicalInterests`, `languageBreakdown`, `experienceLevel`, `savedIssueIds`.
  - `IssueItem`: `id`, `title`, `repository`, `stars`, `labels`, `matchScore`, `explanation`, `difficulty`, `estimatedTime`, `knowledgeGaps`, `roadmap`, `url`.

### C. Re-designed Dashboard ([client/src/pages/Dashboard.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/Dashboard.tsx))
- On load, `fetchUserProfile()` loads the user's profile information.
- If the user meets the `REPO_BENCHMARK = 3` public repository threshold, their actual GitHub repository activity, top projects sorted by stars, actual follower/following counts, and dynamically calculated achievements are loaded. If not, it falls back to a clean mock portfolio.
- Displays language breakdown percentages as a list of **Horizontal Bar Progress Cards** with gradient fills.
- Renders a complete tag list of all extracted technical skills and repository topics at the bottom.

### D. Search & Filters Feed ([client/src/pages/IssueList.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/IssueList.tsx))
- **`⚡ Auto-Select My GitHub Skills`**: Resolves the user's #1 extracted language and automatically applies it to the active filter state.
- **Manual Filters**: Provides advanced filters for language, difficulty levels, and match score thresholds.
- **Direct Link Redirections**: Deep-links to GitHub issues and repository main pages.

### E. Profile Customization ([client/src/pages/Profile.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/Profile.tsx))
- Offers inline editing of display names, custom skill badge additions, focus target domains (Frontend, Backend, DevOps, AI/ML), and saving updates securely to the database.

---

## ⚙️ Backend Server Architecture (`/server`)

### A. Express Server Entrypoint ([server/src/index.ts](file:///d:/Projects/OpenSource-Connect/server/src/index.ts))
- Configured with security middleware (CORS, JSON parsers) and maps `/api/auth`, `/api/user`, and `/api/issues` router scopes.

### B. Non-Blocking Database Connection ([server/src/config/db.ts](file:///d:/Projects/OpenSource-Connect/server/src/config/db.ts))
- Establishes a connection to MongoDB Atlas. If unreachable (offline mode), it catches the exception and falls back to a in-memory database to allow development to continue immediately.

### C. Mongoose Schemas ([server/src/models/User.ts](file:///d:/Projects/OpenSource-Connect/server/src/models/User.ts) & [Issue.ts](file:///d:/Projects/OpenSource-Connect/server/src/models/Issue.ts))
- Defines database schema types for users and cached AI-matched issues.

---

## 🤖 AI Match Engine & GitHub Skill Extraction Service

### A. GitHub Skill & Language Extraction ([server/src/services/githubService.ts](file:///d:/Projects/OpenSource-Connect/server/src/services/githubService.ts))
- Function `extractUserSkills` requests user public repos, aggregates language weights, parses topics/tags, and determines experience levels dynamically based on the total repository count.

### B. Google Gemini 2.0 Flash AI Scoring ([server/src/services/geminiService.ts](file:///d:/Projects/OpenSource-Connect/server/src/services/geminiService.ts))
- Function `analyzeIssueWithGemini` uses Google Generative AI SDK targeting **`gemini-2.0-flash`** to analyze alignment, calculate a custom match score, identify knowledge gaps, and design a step-by-step roadmap checklist.

---

## 🔐 GitHub OAuth 2.0 & JWT Security Flow

- **[server/src/controllers/authController.ts](file:///d:/Projects/OpenSource-Connect/server/src/controllers/authController.ts)**:
  - **`githubLogin`**: Redirects users to GitHub's authorization endpoint.
  - **`githubCallback`**: Exchanges authorization codes for access tokens, loads user metadata, extracts skills, saves profiles, and issues signed JWT authorization tokens (valid for 7 days) back to the client.