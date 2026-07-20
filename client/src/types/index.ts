export interface RoadmapStep {
  step: number;
  task: string;
  completed: boolean;
}

export interface Issue {
  id: string;
  title: string;
  repository: string;
  stars: number;
  labels: string[];
  matchScore: number;
  explanation: string;
  difficulty: string;
  language: string;
  estimatedTime?: string;
  fullExplanation?: string;
  knowledgeGaps?: string[];
  roadmap?: RoadmapStep[];
}

export interface SkillProficiency {
  language: string;
  level: number;
  color: string;
}
