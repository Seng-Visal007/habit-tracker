import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  session: Session | null;
  children: ReactNode;
}

export default function ProtectedRoute({ session, children }: ProtectedRouteProps) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}