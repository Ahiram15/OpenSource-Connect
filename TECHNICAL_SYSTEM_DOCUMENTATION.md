# 🧠 OpenSource Connect — Comprehensive Technical System Documentation

This document provides a deep-dive, code-level explanation of the architecture, data flow, services, algorithms, and implementation details of **OpenSource Connect**.

---

## 📌 1. System Architecture & High-Level Data Flow

OpenSource Connect is structured around an asynchronous, multi-tiered architecture that seamlessly integrates GitHub's REST/OAuth APIs, Google Gemini Large Language Models, Nodemailer SMTP transport, MongoDB Atlas document storage, and high-performance React client renderers.

```
+-------------------------------------------------------------------------------------------------------+
|                                           CLIENT LAYER (React 18 + TypeScript)                         |
|                                                                                                       |
|  [ Dashboard & PDF Export ]    [ Issue Explorer & Filter ]    [ 5-Stage Live Tracker ]               |
|  [ Git Cinema 2D Canvas ]      [ Global AI Copilot Chat ]     [ Profile & SMTP Email Hub ]           |
+-------------------------------------------------------------------------------------------------------+
                                                     │
                                                     ▼ HTTP / JSON (JWT Authorization Header)
+-------------------------------------------------------------------------------------------------------+
|                                        BACKEND CONTROLLERS & ROUTERS                                  |
|                                                                                                       |
|   /api/auth/*             /api/user/*            /api/issues/*            /api/email/*               |
|   (OAuth 2.0 & JWT)       (Profiles & Skills)    (AI Recommendations)     (SMTP Delivery & Alerts)   |
+-------------------------------------------------------------------------------------------------------+
                                                     │
               ┌─────────────────────────────────────┼─────────────────────────────────────┐
               ▼                                     ▼                                     ▼
+-----------------------------+       +-----------------------------+       +-----------------------------+
|      GITHUB SERVICE         |       |       GEMINI AI SERVICE     |       |       EMAIL SERVICE         |
|  (REST API / Octokit / Raw) |       |  (@google/generative-ai)    |       |   (Nodemailer Transport)    |
|                             |       |                             |       |                             |
| • Repos & language parsing  |       | • gemini-2.5-flash model    |       | • Gmail / Custom SMTP pool  |
| • Topic & skill aggregation |       | • Structured JSON parser    |       | • Dark-mode HTML templates  |
| • Live PR & Commit sync     |       | • Resilient heuristic failover|     | • Digest & PR celebrations  |
+-----------------------------+       +-----------------------------+       +-----------------------------+
               │                                     │                                     │
               └─────────────────────────────────────┼─────────────────────────────────────┘
                                                     ▼
+-------------------------------------------------------------------------------------------------------+
|                                          DATA PERSISTENCE LAYER                                       |
|                                                                                                       |
|   [ MongoDB Atlas (Mongoose ODM) ] ── (Fallback: Non-blocking in-memory mock for dev continuity)     |
+-------------------------------------------------------------------------------------------------------+
```

---

## 🎨 2. Frontend Client Implementation (`/client`)

### 2.1 Application Shell & Navigation ([client/src/App.tsx](file:///d:/Projects/OpenSource-Connect/client/src/App.tsx))
* **Routing & Authentication**: Built with `react-router-dom` (v6). Automatically intercepts GitHub OAuth redirects (`?token=...`), saves the JWT to `localStorage`, strips the token query parameter for URL cleanliness, and updates global authenticated states.
* **Navigation Bar**: Responsive glassmorphic sticky header (`backdrop-filter: blur(20px)`) displaying active route indicators, connected GitHub user status, and direct links to **Dashboard**, **Issue Feed**, **Tracker**, **Git Cinema**, and **Profile**.
* **Global Contact & Support Modal**: Accessible from the footer on any page, allowing users to submit feedback, report bugs, or request features. Sends structured feedback via `sendFeedbackApi()` directly to the backend SMTP service.

---

### 2.2 Global AI Copilot ([client/src/components/GlobalChatCopilot.tsx](file:///d:/Projects/OpenSource-Connect/client/src/components/GlobalChatCopilot.tsx))
* **Floating Context-Aware Assistant**: Accessible in the bottom right corner with an expandable floating chat bubble.
* **Instant Action Starters**: Provides pre-configured prompt prompts such as:
  * *"Find Good First Issues for TypeScript"*
  * *"How to open my first Pull Request?"*
  * *"Explain Git Rebase vs Merge"*
  * *"Generate a PR checklist for bug fixes"*
* **Resilient Multi-Tier Response Engine**: Connects to the backend AI endpoint with built-in client-side heuristic fallbacks, markdown formatting, syntax highlighting, and code copying utilities.

---

### 2.3 Interactive Git Cinema Visualizer ([client/src/pages/GitCinema.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/GitCinema.tsx))
* **2D Canvas Graph Visualizer**: A high-performance canvas engine rendering nodes, branches, particle bursts, commit explosions, and animated merge ripple waves.
* **Web Audio API Synthesizer**: Custom real-time audio generator producing musical frequencies and sound effects:
  * *Commit Event*: High-frequency resonant blip (`oscillatorNode`, sine wave).
  * *Branch Creation*: Harmonic ascending dual-tone sweep.
  * *Merge Action*: Deep bass confirmation chime with delay.
* **Timeline Controls**: Scrubbing timeline bar with play/pause, step forward/backward, and multi-speed options (0.5x, 1x, 2x, 4x).
* **Presets & Custom Ingestion**: Includes milestone historic datasets (Linux v0.01, React 16 Fiber Rewrite, Bitcoin Genesis, Next.js App Router) and allows developers to ingest real public GitHub repositories live.

---

### 2.4 Live Contribution Tracker ([client/src/pages/ContributionTracker.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/ContributionTracker.tsx))
* **5-Stage Kanban Lifecycle Pipeline**:
  1. `Identified`: AI-matched issue discovery.
  2. `In Progress`: Local branch created, feature development underway.
  3. `Draft PR Opened`: Work-in-progress pull request created on GitHub.
  4. `In Code Review`: Reviewers assigned, CI checks running.
  5. `Merged & Shipped`: Code accepted into upstream default branch.
* **Live GitHub API Synchronization**:
  * Calls `fetchLiveContributions(username)` to query GitHub's Search API for user pull requests, issues, and commit statuses.
  * Dynamically matches open PRs with pipeline cards and updates their statuses, commit hashes, and review labels.
* **Developer Metrics**: Calculates completion rates, active PR counts, accumulated XP points, and estimated time-to-merge.

---

### 2.5 Dynamic Dashboard & Vector PDF Exporter ([client/src/pages/Dashboard.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/Dashboard.tsx))
* **Proof-of-Work Vector PDF Exporter**: Generates a downloadable, high-fidelity developer resume and open-source contribution summary directly in the browser with custom fonts, skill breakdown charts, and verified GitHub stats.
* **Shareable Portfolio URLs**: Supports public portfolio views using query parameter `/dashboard?user=<username>`.
* **Language & Skill Progress Cards**: Visualizes extracted languages as animated gradient progress bars with weighted percentages.
* **Feature Showcase Widgets**: Embedded widgets for the Live Contribution Tracker, Git Cinema replay teaser, and quick navigation to the Email Hub.

---

### 2.6 Issue Feed & Intelligent Skill Filtering ([client/src/pages/IssueList.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/IssueList.tsx))
* **`⚡ Auto-Select My GitHub Skills`**: Resolves the user's primary detected language from their GitHub profile and applies it to the active filter state with a single click.
* **Multi-Parameter Search Engine**: Filter issues by difficulty (`Good First Issue`, `Beginner`, `Intermediate`, `Advanced`), programming languages, stars, and minimum Gemini Match Score.
* **Deep Links**: Direct links to GitHub issue threads and 1-click launch in GitHub Codespaces (`codespaces.new/{repository}`).

---

### 2.7 Issue Deep-Dive & Learning Roadmaps ([client/src/pages/IssueDetail.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/IssueDetail.tsx))
* **Interactive AI Milestone Checklist**: Displays step-by-step guidance generated by Gemini for resolving the issue. Steps can be toggled interactively with persistent local state.
* **Knowledge Gap Callouts**: Highlights specific concepts (e.g. Redux Toolkit dispatchers, AST transforms, Docker multi-stage builds) required to solve the issue.
* **AI PR Starter Generator**: Generates draft PR titles, implementation outlines, and boilerplate code templates.

---

### 2.8 Profile & SMTP Email Notification Hub ([client/src/pages/Profile.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/Profile.tsx))
* **Email Hub (`#email-hub`)**: Supports hash-based auto-scrolling with a glowing highlight effect when linked from the dashboard.
* **Real-Time SMTP Status Indicator**: Polls `/api/email/status` to show whether the SMTP transporter is live or operating in simulation mode.
* **Test Email & Digest Triggers**: Allows users to dispatch immediate test emails and preview their weekly issue recommendation digest.
* **Custom Skills & Focus Domains**: Add custom technologies and select focus areas (Frontend, Backend, AI/ML, DevOps, Systems).

---

## ⚙️ 3. Backend Server Architecture (`/server`)

### 3.1 Server Entry Point ([server/src/index.ts](file:///d:/Projects/OpenSource-Connect/server/src/index.ts))
* **Express & Middleware**: Configured with CORS, JSON body parsers, proxy trust headers (`app.set('trust proxy', true)`), and environment variable initialization.
* **Route Aliasing**: Supports both `/api/*` and standard `/*` route prefixes to guarantee full compatibility with local Express servers and Vercel serverless functions.
* **Registered Routers**:
  * `/api/auth` ➔ `authRoutes.ts`
  * `/api/user` ➔ `userRoutes.ts`
  * `/api/issues` ➔ `issueRoutes.ts`
  * `/api/email` ➔ `emailRoutes.ts`

---

### 3.2 Resilient Database Connection ([server/src/config/db.ts](file:///d:/Projects/OpenSource-Connect/server/src/config/db.ts))
* Connects to MongoDB Atlas using Mongoose with a strict `serverSelectionTimeoutMS: 2000` limit.
* If MongoDB Atlas is unavailable (e.g., offline dev, firewalls), the server catches the timeout error gracefully, enables an in-memory cache fallback, and boots in under 1 second without throwing unhandled rejections.

---

### 3.3 Database Models & Schemas

#### `User.ts` ([server/src/models/User.ts](file:///d:/Projects/OpenSource-Connect/server/src/models/User.ts))
```typescript
interface IUser {
  githubId: string;
  username: string;
  displayName?: string;
  avatarUrl: string;
  email?: string;
  technicalInterests: string[];
  languageBreakdown: Record<string, number>;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  focusDomain?: string;
  savedIssueIds: string[];
  emailPreferences?: {
    weeklyDigest: boolean;
    prAlerts: boolean;
    securityNotices: boolean;
  };
}
```

#### `Issue.ts` ([server/src/models/Issue.ts](file:///d:/Projects/OpenSource-Connect/server/src/models/Issue.ts))
```typescript
interface IIssue {
  githubIssueId: string;
  title: string;
  body: string;
  repository: string;
  url: string;
  language: string;
  stars: number;
  labels: string[];
  matchScore?: number;
  explanation?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime?: string;
  knowledgeGaps?: string[];
  roadmap?: Array<{ step: number; task: string; completed: boolean }>;
}
```

---

### 3.4 GitHub Skill & Metadata Extraction Service ([server/src/services/githubService.ts](file:///d:/Projects/OpenSource-Connect/server/src/services/githubService.ts))
* **Repository Analysis**: Queries `https://api.github.com/users/{username}/repos?per_page=100` using the authenticated GitHub token.
* **Weighted Language Calculation**: Iterates over all non-fork repositories, calculates language counts, and assigns proportional percentages:
  $$\text{Percentage}(L) = \text{Math.round}\left(\frac{\text{Count}(L)}{\text{Total Valid Repos}} \times 100\right)$$
* **Topic & Tag Aggregation**: Aggregates repository topics into a deduplicated set of developer competencies.
* **Experience Level Determination**:
  * $\ge 20$ repositories $\rightarrow$ `Advanced`
  * $\ge 7$ repositories $\rightarrow$ `Intermediate`
  * $< 7$ repositories $\rightarrow$ `Beginner`

---

### 3.5 Google Gemini AI Match Engine ([server/src/services/geminiService.ts](file:///d:/Projects/OpenSource-Connect/server/src/services/geminiService.ts))
* **Model Selection**: Targets **`gemini-2.5-flash`** / **`gemini-2.0-flash`** via `@google/generative-ai`.
* **Structured JSON Generation**: Instructs the model with strict JSON schema constraints to return match scores, rationale, difficulty, estimated time, and actionable roadmaps.
* **Resilient Multi-Tier Heuristic Failover**: If Gemini hits rate limits (HTTP 429), quota exhaustion, or network disconnects, the system falls back to a deterministic heuristic engine:
  * Computes string-distance and keyword intersections between user interests and issue content.
  * Adjusts baseline scores according to difficulty tier and experience levels.
  * Generates structured roadmap checklists based on repository architecture patterns.

---

### 3.6 Nodemailer SMTP Email System & HTML Templates ([server/src/services/emailService.ts](file:///d:/Projects/OpenSource-Connect/server/src/services/emailService.ts))
* **Transport Setup**: Uses `nodemailer.createTransport()` with environment variables (`SMTP_SERVICE`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
* **Simulation Mode**: If SMTP credentials are not configured, the service logs formatted email dispatches to the console and returns successful simulated message IDs (`sim-<uuid>`), preventing server crashes.
* **Dark-Mode Email Templates**:
  1. **Issue Match Digest**: Features vibrant gradient headers, match percentage pills, repository badges, skill tags, and deep-link action buttons.
  2. **PR Merged Celebration**: Includes celebratory confetti accents, repository statistics, PR title, commit counts, and XP level up notifications.
  3. **System Test Verification**: Server uptime diagnostics and transmission verification timestamps.
  4. **Support & Feedback Forwarder**: Formats and forwards inbound user inquiries to system administrators.

---

### 3.7 Authentication & Security Flow ([server/src/controllers/authController.ts](file:///d:/Projects/OpenSource-Connect/server/src/controllers/authController.ts))
1. **Initiation**: User clicks **Log in with GitHub**. Frontend routes to `/api/auth/github`, which redirects to GitHub's OAuth authorization page.
2. **Code Exchange**: GitHub redirects to `/api/auth/github/callback?code=...`. The controller exchanges the temporary authorization code for a GitHub access token.
3. **Profile Ingestion**: Fetches the user's avatar, username, and repositories, extracts their language profile, and upserts their document in MongoDB Atlas.
4. **JWT Signing**: Signs a JSON Web Token containing the user's `githubId` and `username` (valid for 7 days) using `process.env.JWT_SECRET`.
5. **Client Redirect**: Redirects back to `${CLIENT_URL}/dashboard?token=${jwtToken}`.

---

## 📡 4. REST API Endpoint Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Returns server health status and timestamp |
| `GET` | `/api/auth/github` | Public | Initiates GitHub OAuth 2.0 authorization flow |
| `GET` | `/api/auth/github/callback` | Public | OAuth callback: exchanges code, creates user, returns JWT |
| `GET` | `/api/user/profile` | JWT Required | Fetches the authenticated user's profile and skills |
| `PUT` | `/api/user/profile` | JWT Required | Updates display name, technical interests, or focus domain |
| `GET` | `/api/issues/recommended` | JWT Required | Returns AI-analyzed and scored issue recommendations |
| `GET` | `/api/issues/:id` | Public / JWT | Fetches detailed issue metadata and AI learning roadmap |
| `POST` | `/api/issues/:id/star` | JWT Required | Toggles bookmark / save status for an issue |
| `GET` | `/api/email/status` | Public | Returns SMTP transporter status (connected or simulation) |
| `POST` | `/api/email/test` | Public / JWT | Dispatches an immediate test email to verify delivery |
| `POST` | `/api/email/digest` | Public / JWT | Sends a weekly issue recommendation digest email |
| `POST` | `/api/email/pr-merged` | Public / JWT | Dispatches a celebratory PR merged milestone notification |
| `POST` | `/api/email/feedback` | Public | Sends feedback/support message from global modal to admins |

---

## 🔐 5. Environment Variables

### Backend (`/server/.env`)
```env
# Server Core
PORT=5000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/opensource-connect?retryWrites=true&w=majority

# GitHub OAuth App
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Authentication
JWT_SECRET=your_super_secret_jwt_signing_key

# Nodemailer SMTP Email Hub (Optional - falls back to simulation mode if omitted)
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS="your_app_password"
SMTP_FROM="OpenSource Connect <your_email@gmail.com>"
```

---

## 🧪 6. Verification & Build Integrity

Both client and server codebases are verified with strict TypeScript compilation and production builds:

* **Client Build**:
  ```bash
  cd client && npm run build
  ```
  *Output*: Clean Vite production bundle in `client/dist/` with 0 TypeScript errors.
* **Server Build**:
  ```bash
  cd server && npm run build
  ```
  *Output*: Clean ES/CommonJS compilation in `server/dist/` with 0 TypeScript errors.
