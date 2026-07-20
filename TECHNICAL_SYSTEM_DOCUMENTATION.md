# 🧠 OpenSource Connect — Comprehensive Technical System Documentation

This document provides a deep-dive, code-level explanation of the architecture, data flow, features, and implementation details of **OpenSource Connect**.

---

## 📌 1. System Architecture & High-Level Data Flow

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

## 🎨 2. Frontend Client Implementation (`/client`)

### A. Environment & Vite Configuration ([client/vite.config.js](file:///d:/Projects/OpenSource-Connect/client/vite.config.js))
- **Problem Solved**: When opening the web app via Cloudflare Tunnels (`.trycloudflare.com`), Vite 5 blocked requests with `Blocked request. This host is not allowed`.
- **Solution**: Added `server: { allowedHosts: true, host: true }` in `vite.config.js`. This allows Vite to accept HTTP requests from any host name (local or tunneled) while keeping HMR (Hot Module Replacement) active.

### B. Type Definitions ([client/src/types/index.ts](file:///d:/Projects/OpenSource-Connect/client/src/types/index.ts))
- Standardized TypeScript interfaces for:
  - `UserProfile`: `githubId`, `username`, `avatarUrl`, `technicalInterests`, `languageBreakdown`, `experienceLevel`, `savedIssueIds`.
  - `IssueItem`: `id`, `title`, `repository`, `stars`, `labels`, `matchScore`, `explanation`, `difficulty`, `estimatedTime`, `knowledgeGaps`, `roadmap`, `url`.

### C. Re-designed Dashboard ([client/src/pages/Dashboard.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/Dashboard.tsx))
- **How it Works**: 
  1. On load, `useEffect` calls `fetchUserProfile()` from `api.ts`.
  2. Receives `languageBreakdown` (e.g., `{ TypeScript: 40, JavaScript: 25, React: 15, Node.js: 10, Python: 10 }`).
  3. Maps each language into a **Horizontal Bar Progress Card** with custom vibrant gradient fills (`linear-gradient(90deg, #6366f1, #a855f7)`).
  4. Animates width (`width: ${percentage}%`) with a smooth CSS cubic-bezier transition.
  5. Renders a complete tag list of all extracted technical skills and repository topics at the bottom.

### D. Search & Filters Feed ([client/src/pages/IssueList.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/IssueList.tsx))
- **`⚡ Auto-Select My GitHub Skills`**: When clicked, `handleAutoSelectSkills` reads `userProfile.technicalInterests[0]` (the user's #1 extracted language) and automatically applies it to the filter state.
- **Manual Filters**: State hooks (`selectedLanguage`, `selectedDifficulty`, `minMatchScore`, `sortBy`) filter the issue list dynamically.
- **Direct Link Redirections**:
  - Issue titles: Wrapped in `<a href={issue.url} target="_blank" rel="noopener noreferrer">`.
  - Repo badges: Wrapped in `<a href={`https://github.com/${issue.repository}`} target="_blank">`.
  - Action buttons: Added a **`🔗 GitHub Issue`** button alongside **`🚀 Codespaces`** (`https://codespaces.new/${issue.repository}`).

### E. Profile Customization ([client/src/pages/Profile.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/Profile.tsx))
- **Inline Display Name Editing (`✏️ Edit Name`)**: State hook `isEditingName` toggles an editable input box around `displayName`.
- **Custom Skill Creator (`+ Add Skill`)**: `handleAddCustomSkill` appends any typed string (e.g., `GraphQL`, `Rust`, `TailwindCSS`) to `selectedInterests`.
- **Target Domain & Goal Radio Cards**: Allows developers to pick contribution focus (`Frontend`, `Backend`, `AI/ML`, `DevOps`) and weekly target goals.
- **Save Action**: Calls `updateUserProfile(selectedInterests, experienceLevel, displayName)`, persisting updates to MongoDB Atlas.

---

## ⚙️ 3. Backend Server Architecture (`/server`)

### A. Express Server Entrypoint ([server/src/index.ts](file:///d:/Projects/OpenSource-Connect/server/src/index.ts))
- Express server configured with `cors()`, `express.json()`, and `dotenv.config()`.
- Registers route modules:
  - `app.use('/api/auth', authRoutes)`
  - `app.use('/api/user', userRoutes)`
  - `app.use('/api/issues', issueRoutes)`

### B. Non-Blocking Database Connection ([server/src/config/db.ts](file:///d:/Projects/OpenSource-Connect/server/src/config/db.ts))
- **MongoDB Atlas Integration**: Connects to `process.env.MONGODB_URI` (`mongodb+srv://...`).
- **Offline Dev Protection**: Configured `serverSelectionTimeoutMS: 2000`. If local network or MongoDB is unreachable, it logs a warning and falls back to in-memory data, ensuring the server starts in <1 second without hanging.

### C. Mongoose Schemas ([server/src/models/User.ts](file:///d:/Projects/OpenSource-Connect/server/src/models/User.ts) & [Issue.ts](file:///d:/Projects/OpenSource-Connect/server/src/models/Issue.ts))
- **`UserSchema`**: Stores `githubId`, `username`, `avatarUrl`, `technicalInterests` (Array of strings), `languageBreakdown` (`Schema.Types.Mixed`), `experienceLevel` (`enum: ['Beginner', 'Intermediate', 'Advanced']`), and `savedIssueIds`.
- **`IssueSchema`**: Stores issue metadata, Gemini match score, explanation, knowledge gaps, and step-by-step roadmap items.

---

## 🧠 4. AI Match Engine & GitHub Skill Extraction Service

### A. GitHub Skill & Language Extraction ([server/src/services/githubService.ts](file:///d:/Projects/OpenSource-Connect/server/src/services/githubService.ts))
- Function `extractUserSkills(username, accessToken)`:
  1. Requests `https://api.github.com/users/${username}/repos?per_page=100`.
  2. Iterates over all public repositories without arbitrary truncation.
  3. Counts language occurrences (`languageCounts`) and aggregates repository topics (`topicsSet`).
  4. Calculates language percentage weights:
     $$\text{Percentage}(L) = \text{Math.round}\left(\frac{\text{Count}(L)}{\text{Total Repos}} \times 100\right)$$
  5. Determines experience level based on total public repos ($\ge 20 \rightarrow$ Advanced, $\ge 7 \rightarrow$ Intermediate, $< 7 \rightarrow$ Beginner).

### B. Google Gemini 2.0 Flash AI Scoring ([server/src/services/geminiService.ts](file:///d:/Projects/OpenSource-Connect/server/src/services/geminiService.ts))
- Function `analyzeIssueWithGemini(issueTitle, issueBody, userInterests, userExperience)`:
  1. Uses Google Generative AI SDK (`@google/generative-ai`) targeting **`gemini-2.0-flash`**.
  2. Constructs a prompt embedding developer skills + issue title & description.
  3. Prompts Gemini to return a strict JSON payload:
     ```json
     {
       "matchScore": 92,
       "explanation": "Strong alignment with your React and TypeScript background.",
       "difficulty": "Beginner",
       "estimatedTime": "2-3 hours",
       "knowledgeGaps": ["React Router unmount hooks"],
       "roadmap": [
         { "step": 1, "task": "Reproduce issue locally", "completed": false },
         { "step": 2, "task": "Locate memory leak in useEffect", "completed": false }
       ]
     }
     ```
  4. **Fallback Protection**: If Gemini API quota limit (429) or network issue occurs, it seamlessly uses a local heuristic engine so responses never fail.

---

## 🔐 5. GitHub OAuth 2.0 & JWT Security Flow

- **[server/src/controllers/authController.ts](file:///d:/Projects/OpenSource-Connect/server/src/controllers/authController.ts)**:
  1. **`githubLogin`**: Constructs GitHub OAuth URL: `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=user:email`.
  2. **`githubCallback`**:
     - Exchanges authorization `code` for GitHub access token via `https://github.com/login/oauth/access_token`.
     - Calls `https://api.github.com/user` to get avatar & username.
     - Calls `extractUserSkills(githubUser.login, accessToken)` to extract skills & languages.
     - Upserts user document into **MongoDB Atlas**.
     - Generates 7-day JWT Token using `jwt.sign({ githubId, username }, JWT_SECRET)`.
     - Redirects back to client: `${clientUrl}/dashboard?token=${token}`.
  3. **Dynamic Host Resolution**: Detects `req.get('host')` and `process.env.CLIENT_URL` / `process.env.SERVER_URL` so OAuth works identically on `localhost` or Cloudflare Tunnels!

---

## 📋 6. Summary Checklist of Created / Modified Files

1. **[client/vite.config.js](file:///d:/Projects/OpenSource-Connect/client/vite.config.js)** — Allowed hosts config for Cloudflare Tunnels.
2. **[client/src/services/api.ts](file:///d:/Projects/OpenSource-Connect/client/src/services/api.ts)** — Frontend API client with JWT headers.
3. **[client/src/pages/Dashboard.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/Dashboard.tsx)** — Re-designed Horizontal Bar Progress Cards for language breakdown.
4. **[client/src/pages/IssueList.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/IssueList.tsx)** — Auto-Select skills, expanded filters, and direct GitHub links.
5. **[client/src/pages/IssueDetail.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/IssueDetail.tsx)** — Detailed issue explanation, roadmap checklist, and GitHub redirects.
6. **[client/src/pages/Profile.tsx](file:///d:/Projects/OpenSource-Connect/client/src/pages/Profile.tsx)** — Name editing, custom skill creator, domain focus, and weekly goals.
7. **[server/src/index.ts](file:///d:/Projects/OpenSource-Connect/server/src/index.ts)** — Express server entry point.
8. **[server/src/config/db.ts](file:///d:/Projects/OpenSource-Connect/server/src/config/db.ts)** — MongoDB Atlas connection helper with dev fallback.
9. **[server/src/models/User.ts](file:///d:/Projects/OpenSource-Connect/server/src/models/User.ts)** — User Mongoose schema.
10. **[server/src/models/Issue.ts](file:///d:/Projects/OpenSource-Connect/server/src/models/Issue.ts)** — Issue Mongoose schema.
11. **[server/src/services/githubService.ts](file:///d:/Projects/OpenSource-Connect/server/src/services/githubService.ts)** — GitHub REST API search & 100% skill extraction engine.
12. **[server/src/services/geminiService.ts](file:///d:/Projects/OpenSource-Connect/server/src/services/geminiService.ts)** — Google Gemini 2.0 Flash AI match engine.
13. **[server/src/controllers/authController.ts](file:///d:/Projects/OpenSource-Connect/server/src/controllers/authController.ts)** — GitHub OAuth 2.0 handler & JWT token generator.
14. **[server/src/middleware/authMiddleware.ts](file:///d:/Projects/OpenSource-Connect/server/src/middleware/authMiddleware.ts)** — JWT Bearer token authentication middleware.
15. **[server/src/controllers/userController.ts](file:///d:/Projects/OpenSource-Connect/server/src/controllers/userController.ts)** — Profile & settings API handlers.
