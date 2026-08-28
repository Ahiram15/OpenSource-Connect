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