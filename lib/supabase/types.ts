// Hand-rolled minimal types. Replace with `supabase gen types typescript` output
// when you wire up the Supabase CLI.

export type Platform =
  | "leetcode"
  | "codeforces"
  | "github"
  | "codechef"
  | "atcoder";

export type GoalKind =
  | "daily_problems"
  | "weekly_problems"
  | "weekly_minutes";

export interface Profile {
  id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformAccount {
  id: string;
  user_id: string;
  platform: Platform;
  username: string;
  last_synced_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  day: string;
  platform: Platform | null;
  problems_solved: number;
  contests: number;
  submissions: number;
  seconds_spent: number;
  rating_change: number;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  kind: GoalKind;
  target: number;
  active: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  problem_url: string | null;
  platform: Platform | null;
  difficulty: string | null;
  tags: string[];
  body_md: string;
  solved_at: string | null;
  time_spent_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  platform: Platform | null;
  url: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  source: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      platform_accounts: {
        Row: PlatformAccount;
        Insert: Omit<PlatformAccount, "id" | "created_at"> & { id?: string };
        Update: Partial<PlatformAccount>;
      };
      daily_activity: {
        Row: DailyActivity;
        Insert: Omit<DailyActivity, "id" | "created_at"> & { id?: string };
        Update: Partial<DailyActivity>;
      };
      goals: {
        Row: Goal;
        Insert: Omit<Goal, "id" | "created_at"> & { id?: string };
        Update: Partial<Goal>;
      };
      journal_entries: {
        Row: JournalEntry;
        Insert: Omit<JournalEntry, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<JournalEntry>;
      };
      focus_sessions: {
        Row: FocusSession;
        Insert: Omit<FocusSession, "id" | "created_at" | "duration_seconds"> & { id?: string };
        Update: Partial<FocusSession>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { platform_kind: Platform; goal_kind: GoalKind };
  };
}
