export type Habit = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
};

export type DailyLog = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      habits: {
        Row: Habit;
        Insert: Omit<Habit, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Habit, 'id'>>;
        Relationships: [];
      };
      daily_logs: {
        Row: DailyLog;
        Insert: Omit<DailyLog, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<DailyLog, 'id'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

