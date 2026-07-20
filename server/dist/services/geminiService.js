"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeIssueWithGemini = void 0;
const generative_ai_1 = require("@google/generative-ai");
const analyzeIssueWithGemini = async (issueTitle, issueBody, userInterests, userExperience) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key') {
        try {
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const prompt = `You are an expert AI mentor for open-source developers.
Analyze how well this GitHub issue matches a developer's profile and generate a structured JSON response.

Developer Profile:
- Skills/Interests: ${userInterests.join(', ')}
- Experience Level: ${userExperience}

GitHub Issue:
- Title: ${issueTitle}
- Description: ${issueBody}

Respond strictly with valid JSON adhering to this interface:
{
  "matchScore": number (0 to 100),
  "explanation": "concise 1-2 sentence explanation of why this matches or gaps",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTime": "e.g. 2-3 hours",
  "knowledgeGaps": ["gap 1", "gap 2"],
  "roadmap": [
    { "step": 1, "task": "step description", "completed": false },
    { "step": 2, "task": "step description", "completed": false },
    { "step": 3, "task": "step description", "completed": false }
  ]
}`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleanJson);
        }
        catch (error) {
            console.warn(`[Gemini AI Error Details]:`, error.message || error);
            console.warn(`[Gemini AI Info]: Falling back to heuristic match engine.`);
        }
    }
    // Smart Heuristic Fallback Engine
    return generateHeuristicAnalysis(issueTitle, userInterests, userExperience);
};
exports.analyzeIssueWithGemini = analyzeIssueWithGemini;
const generateHeuristicAnalysis = (title, userInterests, userExperience) => {
    const titleLower = title.toLowerCase();
    const matchedInterests = userInterests.filter((tech) => titleLower.includes(tech.toLowerCase()));
    const score = Math.min(95, 70 + matchedInterests.length * 12);
    return {
        matchScore: score,
        explanation: matchedInterests.length > 0
            ? `Strong alignment with your ${matchedInterests.join(', ')} background based on repo architecture.`
            : `Good match for ${userExperience} level with relevant full-stack fundamentals.`,
        difficulty: userExperience === 'Advanced' ? 'Intermediate' : 'Beginner',
        estimatedTime: '2-3 hours',
        knowledgeGaps: matchedInterests.length === 0 ? ['Core Framework concepts', 'State management patterns'] : ['Event listener lifecycle hooks'],
        roadmap: [
            { step: 1, task: `Review issue documentation and reproduce issue locally`, completed: false },
            { step: 2, task: `Locate component/file handling ${matchedInterests[0] || 'logic'}`, completed: false },
            { step: 3, task: `Write unit test and open draft pull request`, completed: false }
        ]
    };
};
