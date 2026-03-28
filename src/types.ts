export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  sobrietyStartDate: string; // ISO string
  longestStreak: number; // in days
  lastRelapseDate?: string; // ISO string
  notifiedMilestones?: number[]; // list of days already notified
}

export interface JournalEntry {
  id: string;
  uid: string;
  date: string; // ISO string
  content: string;
  mood: "calm" | "tempted" | "struggling" | "victorious";
}

export interface SupportMessage {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface FocusSession {
  id: string;
  uid: string;
  date: string; // ISO string
  duration: number; // in minutes
}
