import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { OfflineBanner } from '@/components/OfflineBanner';
import { UpdateToast } from '@/components/UpdateToast';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <div className="h-5 w-5 rounded-full bg-primary/30" />
          </div>
          <p className="text-sm text-muted-foreground">Loading HabitFlow…</p>
        </div>
      </div>
    );

  return (
    <>
      {/* PWA: Offline connectivity banner */}
      <OfflineBanner />

      {/* PWA: SW update toast */}
      <UpdateToast />

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={session ? <Navigate to="/" replace /> : <Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute session={session}>
                <Dashboard session={session!} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}