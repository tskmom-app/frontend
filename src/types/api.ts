// Shared API types — mirror of the backend response envelope and entities.

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type AiVerificationMode = 'off' | 'mock' | 'gemini';

export interface AppSettings {
  aiVerificationMode: AiVerificationMode;
  aiAutoApproveConfidence: number;
  geminiAvailable: boolean;
}

export interface AiTestResult {
  ok: boolean;
  mode: AiVerificationMode;
  model?: string;
  ms?: number;
  verdict?: string;
  confidence?: number;
  reason?: string;
  error?: string;
}

export type Stage =
  | 'foundation'
  | 'responsibility'
  | 'ownership'
  | 'judgment'
  | 'leadership'
  | 'independence';

export type MissionCategory =
  | 'home'
  | 'family'
  | 'community'
  | 'money'
  | 'thinking'
  | 'character'
  | 'communication'
  | 'leadership'
  | 'problem_solving';

export type StudentStatus = 'active' | 'inactive' | 'paused';
export type AssignmentStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: number;
  admin: Admin;
}

export interface GrowthArea {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface GrowthAreaProgress {
  growthAreaId: string;
  name: string;
  slug: string;
  points: number;
  percent: number;
}

export interface Quest {
  id: string;
  title: string;
  mission: string;
  action: string;
  reflection: string;
  growthAreaId: string;
  category: MissionCategory;
  ageMin: number;
  ageMax: number;
  difficulty: number;
  xpReward: number;
  isActive: boolean;
  requiresProof: boolean;
  proofHint: string | null;
  createdAt: string;
}

export interface QuestWithGrowthArea extends Quest {
  growthAreaName: string;
}

export interface Student {
  id: string;
  parentId: string;
  name: string;
  age: number;
  class: string;
  school: string;
  stage: Stage;
  loginCode: string;
  xp: number;
  streak: number;
  level: number;
  status: StudentStatus;
  lastQuestAt: string | null;
  lastApprovedDate: string | null;
  createdAt: string;
}

export interface Parent {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface AssignmentWithQuest {
  id: string;
  studentId: string;
  questId: string;
  assignedAt: string;
  status: AssignmentStatus;
  quest: Quest;
}

export interface XpTransaction {
  id: string;
  studentId: string;
  points: number;
  reason: string;
  createdAt: string;
}

export interface StudentDetail extends Student {
  parent: Parent;
  assignments: AssignmentWithQuest[];
  xpHistory: XpTransaction[];
  growth: GrowthAreaProgress[];
}

export interface SubmissionAttachment {
  type: 'image' | 'audio' | 'video' | 'document';
  url?: string; // absent once an AI "verify-then-forget" run has discarded the file
  caption?: string;
  hash?: string;
  verified?: boolean;
}

export type AiVerdict = 'approve' | 'reject' | 'unsure';

export interface SubmissionListItem {
  id: string;
  answer: string;
  attachments: SubmissionAttachment[];
  qualityScore: number | null;
  qualityFlags: string[];
  aiVerdict: AiVerdict | null;
  aiConfidence: number | null;
  aiReason: string | null;
  feedback: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  assignmentId: string | null;
  assignmentStatus: AssignmentStatus | null;
  student: { id: string; name: string; stage: Stage };
  quest: { id: string; title: string; xpReward: number };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardData {
  totals: {
    totalStudents: number;
    activeStudents: number;
    submissionsToday: number;
    dailyActiveStudents: number;
    pendingReview: number;
    totalXp: number;
    questCompletionRate: number;
    avgStreak: number;
    maxStreak: number;
    retention30d: number | null;
  };
  stageDistribution: Array<{ stage: Stage; count: number }>;
  activity: Array<{ day: string; submissions: number; approvals: number }>;
  leaderboard: Array<{
    id: string;
    name: string;
    stage: Stage;
    xp: number;
    level: number;
    streak: number;
  }>;
}
