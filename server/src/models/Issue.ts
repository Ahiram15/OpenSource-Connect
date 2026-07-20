import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmapStep {
  step: number;
  task: string;
  completed: boolean;
}

export interface IIssue extends Document {
  issueId: string;
  title: string;
  repository: string;
  stars: number;
  labels: string[];
  matchScore: number;
  explanation: string;
  difficulty: string;
  estimatedTime: string;
  knowledgeGaps: string[];
  roadmap: IRoadmapStep[];
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapStepSchema = new Schema({
  step: { type: Number, required: true },
  task: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const IssueSchema: Schema = new Schema(
  {
    issueId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    repository: { type: String, required: true },
    stars: { type: Number, default: 0 },
    labels: { type: [String], default: [] },
    matchScore: { type: Number, default: 85 },
    explanation: { type: String, default: '' },
    difficulty: { type: String, default: 'Beginner' },
    estimatedTime: { type: String, default: '2-3 hours' },
    knowledgeGaps: { type: [String], default: [] },
    roadmap: { type: [RoadmapStepSchema], default: [] },
    url: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IIssue>('Issue', IssueSchema);
