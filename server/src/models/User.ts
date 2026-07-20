import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  githubId: string;
  username: string;
  avatarUrl: string;
  technicalInterests: string[];
  languageBreakdown: Record<string, number>;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  savedIssueIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    technicalInterests: { type: [String], default: ['React', 'Node'] },
    languageBreakdown: { type: Schema.Types.Mixed, default: {} },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    savedIssueIds: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
