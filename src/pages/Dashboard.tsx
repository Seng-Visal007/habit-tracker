import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Habit } from '@/types/database';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Navbar } from '@/components/Navbar';
import { HabitStats } from '@/components/HabitStats';
import { HabitList } from '@/components/HabitList';

interface DashboardProps {
  session: Session;
}

export default function Dashboard({ session }: DashboardProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch initial habits on mount
  useEffect(() => {
    let isMounted = true;

    const fetchHabits = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error('Error fetching habits:', error.message);
      } else {
        setHabits(data || []);
      }
      setLoading(false);
    };

    fetchHabits();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Major Section: Navigation Bar (Wrapped in ErrorBoundary) */}
      <ErrorBoundary sectionName="Navigation Bar">
        <Navbar
          session={session}
          avatarUrl={avatarUrl}
          onAvatarUpdated={(url) => setAvatarUrl(url)}
        />
      </ErrorBoundary>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 2. Major Section: Habit Statistics (Wrapped in ErrorBoundary) */}
        <ErrorBoundary sectionName="Habit Statistics">
          {/* TIP: To take your crash deliverable screenshot, change shouldCrash to true below! */}
          <HabitStats habits={habits} shouldCrash={false} />
        </ErrorBoundary>

        {/* 3. Major Section: Habit List (Wrapped in ErrorBoundary) */}
        <ErrorBoundary sectionName="Habit List">
          <HabitList
            session={session}
            habits={habits}
            loading={loading}
            onHabitsChange={(updated) => setHabits(updated)}
            shouldCrash={false}
          />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground mt-auto">
        <p>HabitFlow &bull; Robust Client-Side Validation &amp; Fault-Isolated Error Boundaries</p>
      </footer>
    </div>
  );
}