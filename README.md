# **OpenSource Connect – AI-Powered GitHub Issue Recommendation Platform**

OpenSource Connect is a web platform designed to help developers (especially beginners) find open-source GitHub issues that match their technical skills, interests, and programming languages. It analyzes user profiles, scores open issues using AI (Gemini), and provides custom explanations along with step-by-step **AI Learning Roadmaps** to bridge any knowledge gaps.

---

## 🛠️ Technology Stack

* **Frontend (Client)**:
  * **React.js (Vite)**: For modular components and fast single-page app loading.
  * **Tailwind CSS**: For sleek, custom styles (dark theme, glassmorphism card panels).
  * **Recharts**: For language proficiency charts and contribution analytics on the dashboard.
* **Backend (Server)**:
  * **Node.js & Express.js**: For routing and logic endpoints.
  * **MongoDB**: For storing user configuration parameters, skills, and bookmark logs.
* **APIs**:
  * **GitHub REST/GraphQL API**: For authenticating users (OAuth) and pulling repository issues.
  * **Google Gemini API**: To evaluate issues, calculate match percentages, and generate learning roadmaps.

---

## 🎨 Theme Colors (Tailwind Design Tokens)

All interface elements use these CSS variables defined in `/client/src/index.css`:
* 🌌 **Background (`--bg-dark` / `#0b0f19`)**: Dark slate background.
* 🛡️ **Surface (`--surface` / `#1e293b`)**: Slate container panels.
* 🔮 **Primary Accent (`--primary` / `#6366f1`)**: Indigo for primary action links and AI elements.
* 🟢 **Success Match (`--success` / `#10b981`)**: Emerald green for Match scores (e.g., `90%+`).
* 🫧 **Glass Backplate (`--glass-bg` / `rgba(15, 23, 42, 0.45)`)**: Glassmorphism transparency.

---

## 📁 Repository Structure

```text
opensource-connect/
│
├── client/          # React frontend client source files
├── server/          # Node.js + Express backend server source files
├── README.md
└── .gitignore
```

---

## 👥 Work Division (Frontend-First Plan)

We split tasks page-by-page so both developers can work in parallel with zero git conflicts.

### Phase 1: Frontend Development UI
* **Developer 1 (User Space)**: Landing/Login Page, Dashboard analytics screens, and Profile preferences forms.
* **Developer 2 (Issue Space)**: Issue feeds cards, search & filter sidebars, and AI learning roadmaps step checklists.

### Phase 2: Backend Development API
* **Developer 1**: Express server setup, MongoDB mongoose schemas, and GitHub OAuth verification routes.
* **Developer 2**: GitHub API issues fetcher, Gemini API recommendation engine, and bookmark database routes.

---

## 🔄 Git & GitHub Workflow for Beginners

### 1. Daily Setup Check
Before starting your day, download the latest code pushed by your partner:
```bash
git checkout main
git pull origin main
git checkout feature/your-branch-name
git merge main
```

### 2. Standard Branch Creation
Work on a separate branch representing the feature you are building:
* **Developer 1 Branch**: `git checkout -b feature/frontend-user-space`
* **Developer 2 Branch**: `git checkout -b feature/frontend-issues`

### 3. Save & Upload Code
```bash
# 1. Stage changes
git add .

# 2. Save locally
git commit -m "feat: Add custom Recharts widget to Dashboard page"

# 3. Push to GitHub
git push origin feature/your-branch-name
```
Open a **Pull Request** on GitHub, review the lines added, and merge into `main` after review.

---

## 📄 API Interface Contract (Mock Data JSON)
During Frontend development, use this mock template inside React state objects:
```json
[
  {
    "id": "issue-101",
    "title": "Fix React routing leak on component unmount",
    "repository": "facebook/react-router",
    "stars": 49200,
    "labels": ["bug", "good first issue"],
    "matchScore": 92,
    "explanation": "Matches your profile history because you have React experience. It uses standard hook triggers.",
    "difficulty": "Intermediate",
    "estimatedTime": "2-3 hours",
    "knowledgeGaps": [
      "React Router transitions",
      "Effect unmount cleanup hooks"
    ],
    "roadmap": [
      { "step": 1, "task": "Read React Router documentation on route transitions", "completed": false },
      { "step": 2, "task": "Locate the memory leak event listener inside code", "completed": false },
      { "step": 3, "task": "Add a return function inside useEffect to remove listener", "completed": false }
    ]
  }
]
```