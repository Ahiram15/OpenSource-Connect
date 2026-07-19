# **A Beginner's Guide to Git & GitHub**

This guide is designed for absolute beginners to help you and your project partner collaborate on code using Git and GitHub.

---

## 💡 What is the difference between Git and GitHub?

* **Git**: A software tool installed on your computer. It tracks the changes you make to your files (like a save-state history).
* **GitHub**: A website ([github.com](https://github.com/)) where you upload your project files so your partner can download them, review them, and work on them.

---

## 🛠️ Step 1: Initial Setup (Do this once)

### 1. Install Git
- Go to [git-scm.com](https://git-scm.com/) and download Git for Windows.
- Run the installer. You can click "Next" on all default options.

### 2. Open Your Terminal
- Open **VS Code**.
- Open your project folder in VS Code (`File ➜ Open Folder`).
- Open the built-in Terminal in VS Code by pressing **``Ctrl + ` ``** (Control + Backtick) or selecting **Terminal ➜ New Terminal** from the top menu.

### 3. Tell Git Who You Are
Run these commands in your VS Code Terminal (replace with your own name and email):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 4. Create a GitHub Account
- Go to [github.com](https://github.com/) and register a free account.
- Confirm your email address.

---

## 📂 Step 2: Setting up Your Shared Project

### 1. Create a Repository (Only one person does this)
- Go to GitHub, click the **`+`** icon in the top-right, and select **New repository**.
- Name it `opensource-connect`.
- Select **Public** or **Private**.
- Click **Create repository**.

### 2. Invite Your Partner (The repository owner does this)
- On your GitHub repository page, click **Settings** (gear icon at the top).
- Select **Collaborators** on the left menu.
- Click **Add people**, search for your partner's GitHub username or email, and invite them.
- **Your partner must check their email or GitHub notifications to accept the invitation.**

### 3. Copy the Repository to Your Computer (Both do this)
- Copy the repository URL (it looks like `https://github.com/username/opensource-connect.git`).
- Open your terminal in the folder where you store projects and run:
  ```bash
  git clone https://github.com/Ahiram15/OpenSource-Connect.git
  ```
- This will download a copy of the project folder to your computer.

---

## 🔄 Step 3: Your Daily Git Workflow

When working with a partner, **never** write code directly on the `main` branch. Always work on a separate branch (your personal draft sandbox).

### 1. Create a Feature Branch
Before writing any code, create a branch named after the feature you are building:
```bash
# Example: If you are building the login screen
git checkout -b feature/login-ui
```
*Note: The `-b` flag means "create a new branch".*

### 2. Write Your Code
- Open your files in VS Code and make changes.
- Save your files (`Ctrl + S`).

### 3. Check What Files You Changed
Run this command to see a list of modified files (modified files will appear in red):
```bash
git status
```

### 4. Stage Your Changes (Prepare to Save)
Tell Git which files you want to save. Use `.` to select all changed files:
```bash
git add .
```
*(If you run `git status` again, the files will now appear green, meaning they are ready to be saved).*

### 5. Commit Your Changes (Save Locally)
Write a brief, simple message explaining what you did:
```bash
git commit -m "feat: Add buttons and style to the login screen"
```
*This saves your changes on your local computer, but does NOT upload them to GitHub yet.*

### 6. Push Your Changes (Upload to GitHub)
Upload your feature branch to the GitHub server:
```bash
git push origin feature/login-ui
```

---

## 🔀 Step 4: Merging Code with Your Partner

Once your feature branch is pushed to GitHub, you need to merge it into the main code so your partner can see it.

### 1. Create a Pull Request (PR)
- Go to [github.com](https://github.com/) and navigate to your repository.
- You will see a yellow banner saying **Compare & pull request**. Click it.
- Write a short description of what you built.
- Click the green **Create pull request** button.

### 2. Review and Merge
- Your partner can look at the Pull Request to see what lines of code you added.
- Once everything looks good, click **Merge pull request** and then **Confirm merge**.
- The code from `feature/login-ui` is now successfully joined with `main`!

### 3. Get the Latest Code
Before starting your next feature, make sure to fetch your partner's merged code from GitHub:
```bash
# 1. Switch back to the main branch
git checkout main

# 2. Download all updates from GitHub
git pull origin main

# 3. Create a new branch for your next feature
git checkout -b feature/my-next-feature
```

---

## ⚠️ Step 5: Troubleshooting Common Mistakes

### 1. "I made a mistake in my code and want to undo my unsaved changes"
If you wrote bad code and want to restore your files back to the last save point:
```bash
git restore .
```

### 2. "I got a Merge Conflict!"
A merge conflict happens when you and your partner edit the **exact same line** in the same file. Git gets confused and doesn't know which line to keep.
- **How to fix it in VS Code:**
  1. Open the conflicting file in VS Code.
  2. You will see green and blue markers:
     - `<<<<<<< HEAD (Current Change)` (Your code)
     - `=======` (The divider)
     - `>>>>>>> main (Incoming Change)` (Your partner's code)
  3. Click the text buttons above the markers: **Accept Current Change**, **Accept Incoming Change**, or **Accept Both**.
  4. Once resolved, save the file, then run:
     ```bash
     git add .
     git commit -m "chore: Resolve merge conflicts"
     git push origin feature/your-branch
     ```
