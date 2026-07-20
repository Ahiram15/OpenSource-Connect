import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  githubId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  location: string;
  githubProfileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  technicalInterests: string[];
  languageBreakdown: Record<string, number>;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  savedIssueIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    githubId:         { type: String, required: true, unique: true },
    username:         { type: String, required: true },
    displayName:      { type: String, default: '' },
    avatarUrl:        { type: String, default: '' },
    bio:              { type: String, default: '' },
    location:         { type: String, default: '' },
    githubProfileUrl: { type: String, default: '' },
    publicRepos:      { type: Number, default: 0 },
    followers:        { type: Number, default: 0 },
    following:        { type: Number, default: 0 },
    technicalInterests: { type: [String], default: ['React', 'Node'] },
    languageBreakdown:  { type: Schema.Types.Mixed, default: {} },
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
