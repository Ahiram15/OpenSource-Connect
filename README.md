# **OpenSource Connect** 🚀

> **Live Deployment:** [open-source-connect-five.vercel.app](https://open-source-connect-five.vercel.app/)  
> **Repository:** [github.com/Ahiram15/OpenSource-Connect](https://github.com/Ahiram15/OpenSource-Connect)

**OpenSource Connect** is an AI-powered developer intelligence platform designed to bridge the gap between open-source repositories and aspiring or experienced contributors. Finding suitable issues across millions of GitHub repositories can be daunting. OpenSource Connect eliminates this friction by analyzing your public GitHub profile, extracting your technical stack and experience level, and providing AI-scored issue recommendations, interactive learning roadmaps, real-time contribution tracking, visual git history simulations, and automated email alerts.

---

## 🌟 Key Highlights & Core Features

### 1. 🤖 AI-Powered Issue Recommendation & Match Scoring
* **Google Gemini AI Integration (`gemini-2.5-flash` / `gemini-2.0-flash`)**: Analyzes issue descriptions against your GitHub skill profile to generate customized **Match Scores (0–100%)**, concise explanations, difficulty ratings, and estimated completion times.
* **Knowledge Gap Detection & Step-by-Step Roadmaps**: Pinpoints concepts you need to learn and provides milestone checklists to guide your pull request from reproduction to merge.
* **Multi-Tier Resilient Heuristic Fallback**: Automatic failover ensuring 100% uptime even during rate limits or offline development.

### 2. 📊 Live Contribution Tracker & GitHub Pipeline Sync (`/tracker`)
* **5-Stage Visual Kanban Pipeline**: Track issues through *Identified (AI Matched)* ➔ *In Progress* ➔ *Draft PR Opened* ➔ *In Code Review* ➔ *Merged & Shipped*.
* **Live GitHub Polling & Sync**: Automatically synchronizes your active GitHub PRs, issues, and commits into interactive lifecycle cards.
* **Milestone Notes & XP Progression**: Add custom dev notes, track time spent, log branch names, and calculate your open-source impact metrics.

### 3. 🎬 Git Cinema — Interactive Codebase Replay Theater (`/cinema`)
* **2D Canvas Graph Engine**: Interactive visual playback of commit histories, branch splits, merge ripple effects, and particle animations.
* **Web Audio API Synthesizer**: Generates dynamic musical and sci-fi audio cues synced with commit types and merge actions.
* **Historic Presets & Live Ingestion**: Replay milestone repositories (Linux Kernel v0.01, React 16 Fiber Rewrite, Bitcoin Genesis, Next.js App Router) or load any public GitHub repository.

### 4. ✉️ SMTP Email Notification Hub & Automated Alerts (`/profile#email-hub`)
* **Nodemailer SMTP Integration**: Real-world delivery configured via Gmail or custom SMTP hosts.
* **Curated Dark-Mode HTML Templates**:
  * **Weekly Issue Match Digest**: Top matching issues delivered directly to your inbox with match % tags.
  * **PR Merged Celebration**: Confetti-themed milestone celebration emails with repository statistics.
  * **System Health & Test Dispatch**: 1-click test email dispatch to verify SMTP delivery instantly.
* **In-App Preferences & Global Contact Modal**: Toggle notification preferences and submit feedback via the global contact modal.

### 5. 💬 Global AI Copilot Assistant
* **Floating Context-Aware Copilot**: Accessible across every page (`GlobalChatCopilot.tsx`) for instant Git advice, PR starter code drafts, architecture hints, and contribution guidance.

### 6. 📄 Proof-of-Work Vector PDF Export & Public Portfolios
* **1-Click High-Resolution PDF Export**: Export an authenticated, employer-ready open-source contribution resume directly from your Dashboard.
* **Shareable Portfolio URLs**: Share your developer profile and stats with peers and recruiters via `/dashboard?user=<username>`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS, Lucide React, Recharts, Canvas API, Web Audio API |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, Nodemailer, Dotenv, CORS |
| **Database** | MongoDB Atlas (with non-blocking in-memory dev fallback) |
| **AI / LLM** | Google Gemini API (`@google/generative-ai`), Heuristic Match Engine |
| **APIs & Protocols** | GitHub REST API v3, GitHub OAuth 2.0, SMTP (Gmail / Custom) |
| **Deployment** | Vercel (Frontend & Serverless Backend), Cloudflare Tunnels (Dev Tunneling) |

---

## 💻 Getting Started

### 1. Prerequisites
* [Node.js (v18+)](https://nodejs.org/)
* [MongoDB Atlas Account](https://www.mongodb.com/) or local MongoDB instance
* [GitHub Developer App](https://github.com/settings/developers) (for OAuth Client ID & Secret)
* [Google AI Studio Key](https://aistudio.google.com/) (for Gemini API)

### 2. Clone the Repository
```bash
git clone https://github.com/Ahiram15/OpenSource-Connect.git
cd OpenSource-Connect
```

### 3. Backend Environment Setup
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/opensource-connect?retryWrites=true&w=majority
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET=your_jwt_signing_secret_here

# SMTP Email Configuration (Optional - falls back to dev simulation mode if omitted)
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS="your_gmail_app_password"
SMTP_FROM="OpenSource Connect <your_email@gmail.com>"
```

### 4. Run the Development Environment

#### Backend Server
```bash
cd server
npm install
npm run dev
```
*Server starts on `http://localhost:5000`.*

#### Frontend Client
```bash
cd client
npm install
npm run dev
```
*Client starts on `http://localhost:5173`.*

---

## 🧠 System Architecture & Data Flow

```
[ Developer Browser ]
       │
       ▼ (1. Authenticate with GitHub OAuth 2.0)
[ GitHub OAuth Gateway ] ──► Exchanges authorization code for JWT session
       │
       ▼ (2. Extract Repos, Languages, Topics & Experience)
[ githubService.ts ] ──► Aggregates language weights & developer benchmarks
       │
       ▼ (3. Store Profile & Cache Issues)
[ MongoDB Atlas Database ]
       │
       ├────────────────────────────────────────┬───────────────────────────────────────┐
       ▼ (4. AI Match Analysis)                 ▼ (5. Git Cinema Canvas)                ▼ (6. SMTP Alerts)
[ geminiService.ts ]                      [ GitCinema.tsx ]                      [ emailService.ts ]
  - Issue Match Scoring (0-100%)            - 2D Canvas Branch Renderer            - Issue Digest Dispatch
  - Learning Roadmaps & Knowledge Gaps      - Web Audio Synth Cues                 - PR Merged Celebrations
  - Global Copilot Guidance                 - Git History Playback                 - Contact & Support Relay
       │
       ▼ (7. Render Dynamic Developer Workspace)
[ React 18 + TypeScript UI ] (Dashboard, Issue Feed, Tracker, Git Cinema, Profile)
```

---

## 📂 Project Structure

```
OpenSource-Connect/
├── client/                               # Frontend React + TypeScript Application
│   ├── src/
│   │   ├── components/
│   │   │   └── GlobalChatCopilot.tsx     # Context-aware floating AI Copilot
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx             # Main dashboard, portfolio, PDF export & widgets
│   │   │   ├── IssueList.tsx             # AI-filtered issue search feed
│   │   │   ├── IssueDetail.tsx           # Issue deep-dive, roadmaps & PR starters
│   │   │   ├── ContributionTracker.tsx   # 5-stage live contribution lifecycle tracker
│   │   │   ├── GitCinema.tsx             # Interactive 2D canvas & audio git replay
│   │   │   ├── Profile.tsx               # Developer profile, custom skills & Email Hub
│   │   │   └── Login.tsx                 # OAuth landing page & showcase
│   │   ├── services/
│   │   │   └── api.ts                    # Typed API client with JWT interceptors
│   │   ├── types/
│   │   │   └── index.ts                  # Shared TypeScript models
│   │   ├── App.tsx                       # App router, nav header & global feedback modal
│   │   └── main.tsx                      # Vite React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/                               # Backend Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                     # Resilient MongoDB Atlas connector
│   │   ├── controllers/
│   │   │   ├── authController.ts         # GitHub OAuth 2.0 & JWT issuance
│   │   │   ├── emailController.ts        # SMTP status, digests & PR celebrations
│   │   │   ├── issueController.ts        # AI issue recommendation handlers
│   │   │   └── userController.ts         # Profile & preference management
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts         # JWT bearer authentication
│   │   ├── models/
│   │   │   ├── User.ts                   # User profile & skill breakdown schema
│   │   │   └── Issue.ts                  # Issue cache & match metadata schema
│   │   ├── routes/
│   │   │   ├── authRoutes.ts             # /api/auth routes
│   │   │   ├── emailRoutes.ts            # /api/email routes
│   │   │   ├── issueRoutes.ts            # /api/issues routes
│   │   │   └── userRoutes.ts             # /api/user routes
│   │   ├── services/
│   │   │   ├── emailService.ts           # Nodemailer transport & HTML email templates
│   │   │   ├── geminiService.ts          # Google Gemini AI match & copilot engine
│   │   │   └── githubService.ts          # GitHub REST API aggregator
│   │   └── index.ts                      # Express application entrypoint
│   ├── package.json
│   └── tsconfig.json
│
├── README.md                             # Project overview & quickstart
└── TECHNICAL_SYSTEM_DOCUMENTATION.md     # Deep-dive architecture & implementation guide
```

---

## 🔒 Security & Best Practices
* **OAuth 2.0 & JWT Security**: Secure authorization code exchange with standard JWT tokens (7-day validity).
* **Safe Credential Management**: Environment variables isolation with zero hardcoded secret leakage.
* **Robust Error Handling**: Non-blocking database connectors, fallback AI engines, and SMTP simulation failovers protect the user experience from API interruptions.
* **CORS & Tunnel Support**: Configured for local development, Vercel deployments, and Cloudflare tunnel domains.

---

## 📜 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🤝 Contributing
Contributions are welcome! Please check out the [Issue Feed](https://open-source-connect-five.vercel.app/issues) or submit a Pull Request following standard GitHub flow.