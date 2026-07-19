# Implementation Plan - OpenSource Connect (Frontend-First with Git Guide)

This plan explains how you and your partner can use **Antigravity (your AI Coding Assistant)** and **Git/GitHub** to build this project together from scratch. 

In this plan, we use a **Frontend-First** strategy: both of you will build the frontend screens first, then you will both move to the backend.

---

## 🛠️ Technology Stack

* **Frontend (Client)**:
  * **React.js (Vite)**: To build a fast, single-page UI.
  * **Tailwind CSS**: For custom, premium designs (like dark mode and glassmorphism).
  * **Recharts**: For language proficiency charts on the dashboard.
* **Backend (Server)**:
  * **Node.js & Express.js**: To run the backend server and endpoints.
  * **MongoDB**: To save user logins, skills, and bookmarked issues.
* **APIs**:
  * **GitHub API**: For Git authorization and issue fetching.
  * **Google Gemini API**: To calculate match scores and build roadmaps.

---

## 🤖 How to use Antigravity to build code

Since both of you have Antigravity in your IDE, you can ask the AI to write the code for you. 

### Rules for prompting Antigravity:
1. **Explain the specific file**: Tell Antigravity exactly which file you want to write (e.g., "Create a dashboard screen in `client/src/pages/Dashboard.jsx`").
2. **Provide context**: Mention that you are using **React** and **Tailwind CSS**.
3. **Be descriptive**: Tell the AI what buttons, styles, and colors you want (e.g., "Use a dark theme with a glass-like header card and purple buttons").

---

## 🤝 How to Use Git & GitHub (Detailed Guide from Scratch)

Think of GitHub like a shared Google Drive for your code. Follow these steps to work together without overwriting each other's files.

### Step 1: Initial Tool Setup (Do this once)
1. **Install Git**: Go to [git-scm.com](https://git-scm.com/) and download Git for Windows. Install it using the default settings.
2. **Tell Git who you are**: Open your terminal in VS Code (select `Terminal ➜ New Terminal` from the top menu) and run these commands (replace with your details):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

### Step 2: Set Up Your Shared Repository
1. **Create the Repository**: Log in to [github.com](https://github.com/), click the **`+`** icon in the top-right corner, select **New repository**, and name it `opensource-connect`.
2. **Invite Your Partner**: In your new repository page, click **Settings** ➜ **Collaborators** ➜ **Add people**. Input your partner's GitHub username to invite them. **Your partner must accept the invite in their email.**
3. **Clone to Your Computer**: Both partners must clone the repository locally. Open your terminal in your projects directory and run:
   ```bash
   git clone https://github.com/Ahiram15/OpenSource-Connect.git
   ```

### Step 3: Branching (Your own workspace)
To avoid mixing up your work, never edit the main code directly. Always work in a "branch" (your own copy of the files):
- **Partner 1** (Frontend UI) runs:
  ```bash
  git checkout -b feature/frontend-user-space
  ```
- **Partner 2** (Issues Feed UI) runs:
  ```bash
  git checkout -b feature/frontend-issues
  ```

### Step 4: Coding & Saving Your Progress
As you write code, save and upload your changes to GitHub daily:
1. **Check what changed**:
   ```bash
   git status
   ```
2. **Stage your files** (select files to save):
   ```bash
   git add .
   ```
3. **Commit your files** (save locally on your PC with a message):
   ```bash
   git commit -m "feat: Add buttons and styles to the login screen"
   ```
4. **Push your files** (upload them to GitHub):
   ```bash
   git push origin feature/your-branch-name
   ```

### Step 5: Creating a Pull Request (PR) & Merging
To combine your feature branch into the main code:
1. Go to your repository on [github.com](https://github.com/).
2. Click the green **Compare & pull request** button next to your branch.
3. Write a description of what you completed and click **Create pull request**.
4. Let your partner click **Merge pull request** to approve it.
5. Once merged, get the updated code on your computer:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/next-feature-branch
   ```

### Step 6: Resolving a Merge Conflict (If they happen)
A conflict occurs if you and your partner change the **exact same line** in a file.
1. Open the conflicting file in VS Code.
2. You will see green and blue code markers with options: **Accept Current Change**, **Accept Incoming Change**, or **Accept Both**.
3. Choose the version you want to keep, save the file, and commit/push the resolution:
   ```bash
   git add .
   git commit -m "chore: Resolve merge conflicts"
   git push origin feature/your-branch-name
   ```

---

## 🎨 Phase 1: Frontend Development First (Both Partners)

To avoid conflicts, we divide the pages of the React app between the two of you.

### 🏁 Step 0: Set Up the Routes (Do this together)
Before starting, create empty files for all pages and hook them up in your router (`client/src/App.jsx`). This ensures that your files exist on the `main` branch before you start adding code.
* `/client/src/pages/Dashboard.jsx` (empty file)
* `/client/src/pages/IssueList.jsx` (empty file)
* `/client/src/pages/IssueDetail.jsx` (empty file)
* `/client/src/pages/Profile.jsx` (empty file)

---

### 👤 Partner 1: Landing, Dashboard, & Profile UI
Ask **Antigravity** to help you build:
1. **Landing / Login Page (`client/src/pages/Login.jsx`)**: 
   - A beautiful splash screen with a "Log in with GitHub" button.
2. **Dashboard (`client/src/pages/Dashboard.jsx`)**:
   - A workspace dashboard containing summary blocks (e.g., Total Contributions, Saved Issues) and dummy charts showing language skills.
3. **Profile Settings (`client/src/pages/Profile.jsx`)**:
   - A screen where the user can check off their technical interests (like React, Node, Python) and experience levels.

---

### 🔍 Partner 2: Recommendations, Search, & Roadmap UI
Ask **Antigravity** to help you build:
1. **Issue List Feed (`client/src/pages/IssueList.jsx`)**:
   - A feed displaying cards. Each card represents a GitHub issue, showing title, repository name, programming language tag, and a green circular Match Score (e.g., `92%`).
2. **Search and Filters**:
   - A side navigation bar to filter issues by language or difficulty level (e.g. *good first issue*).
3. **Issue Detail & Roadmap (`client/src/pages/IssueDetail.jsx`)**:
   - A details screen showing the full issue explanation, the AI match rationale, and an interactive **Learning Roadmap checklist** (e.g., Step 1: Read React router docs, Step 2: Learn Git rebasing).

---

## ⚙️ Phase 2: Backend Development (Both Partners)

Once all frontend pages look beautiful, merge both branches into `main`. Now, both of you move to the `server/` directory to write the backend.

### 🛡️ Partner 1: Express Server & Auth API
* Ask **Antigravity** to build:
  1. The Express server setup in `server/src/index.js`.
  2. The GitHub OAuth endpoints. When the frontend clicks "Log In", this API redirects to GitHub and returns a user token.
  3. The User profile database schema in MongoDB.

### 🧠 Partner 2: GitHub Ingestion & Gemini AI recommendations
* Ask **Antigravity** to build:
  1. A service to fetch open issues from GitHub API.
  2. The Google Gemini prompt integration. It sends user skills + issue body to Gemini, and parses the response to get the Match Score, gap explanations, and roadmap checklist.
  3. The REST API endpoints (like `/api/recommendations`) to send this data back to the frontend.

---

## 📄 Frontend/Backend API Contract (Mock Data)

Since you are building the frontend before the backend exists, the **Frontend Developer** needs mock data to build and test the screens. Use this JSON format inside your React code to display sample recommendations:

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

---

## 🛠️ Git Tips for Parallel Work
1. **Work in your designated files only**: Since Partner 1 works in `Dashboard.jsx`/`Profile.jsx` and Partner 2 works in `IssueList.jsx`/`IssueDetail.jsx`, you will never have Git conflicts!
2. **Pull Main frequently**: Before starting your day, run:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-branch-name
   git merge main
   ```
   This updates your branch with your partner's merged frontend work.

---

## 📈 Tips to Stay Consistent

1. **Design System & Theme Colors**:
    Save your colors as CSS variables in `client/src/index.css` so you both use identical branding:
    ```css
    :root {
      /* Theme Color Palette */
      --bg-dark: #0b0f19;       /* Slate-950: Dark background of the website */
      --surface: #1e293b;       /* Slate-800: Solid container background */
      --text-main: #f8fafc;     /* Slate-50: Bright white text for headings */
      --text-muted: #94a3b8;    /* Slate-400: Light gray text for descriptions */
      
      /* Accent Colors */
      --primary: #6366f1;       /* Indigo-500: Electric purple-blue for buttons, logos, and AI items */
      --success: #10b981;       /* Emerald-500: Vibrant green for High Match scores & badges */
      --warning: #f59e0b;       /* Amber-500: Yellow/orange for Medium Match scores */
      
      /* Glassmorphism Panel Styles */
      --glass-bg: rgba(15, 23, 42, 0.45);   /* Dark translucent backplate */
      --glass-border: rgba(255, 255, 255, 0.08); /* Clean, thin border line */
    }
    ```
2. **Keep the Task Board Updated**:
   Update `task.md` whenever you start a task (using `[/]`) or finish it (using `[x]`) so both partners know what is being worked on.
3. **Standup Syncs**:
   Have a short 5-minute conversation before coding to align on yesterday's progress, today's targets, and any blockers.
4. **Context Prompting**:
   Always tell Antigravity the exact folder you are working in (`client/` or `server/`) and your tech stack (React + Tailwind CSS) so it generates consistent code formats.
