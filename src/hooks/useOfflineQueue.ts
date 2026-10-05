import { useEffect, useRef, useCallback, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Habit } from '@/types/database';

const QUEUE_KEY = 'habitflow:offline-queue';

interface QueuedHabit {
  id: string; // temp local id (uuid-like timestamp)
  title: string;
  user_id: string;
  queued_at: string;
}

// ----------- Persistence helpers -----------

function loadQueue(): QueuedHabit[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as QueuedHabit[];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedHabit[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// Deterministic temp ID so items stay stable across re-renders
function tempId(): string {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ----------- Hook -----------

interface UseOfflineQueueResult {
  /** Queued items waiting to sync */
  queue: QueuedHabit[];
  /** Call instead of direct supabase insert — routes through queue when offline */
  addHabit: (title: string) => Promise<Habit | null>;
  /** Number of items pending sync */
  pendingCount: number;
}

export function useOfflineQueue(session: Session, onSynced: (habits: Habit[]) => void): UseOfflineQueueResult {
  const [queue, setQueue] = useState<QueuedHabit[]>(loadQueue);
  const onSyncedRef = useRef(onSynced);
  useEffect(() => { onSyncedRef.current = onSynced; }, [onSynced]);

  // ----------- Sync pending items on reconnect -----------
  const syncQueue = useCallback(async () => {
    const current = loadQueue();
    if (current.length === 0) return;

    const synced: Habit[] = [];
    const failed: QueuedHabit[] = [];

    for (const item of current) {
      try {
        const { data, error } = await supabase
          .from('habits')
          .insert([{ title: item.title, user_id: item.user_id }])
          .select()
          .single();

        if (error || !data) {
          failed.push(item);
        } else {
          synced.push(data as Habit);
        }
      } catch {
        failed.push(item);
      }
    }

    saveQueue(failed);
    setQueue(failed);

    if (synced.length > 0) {
      console.log(`[OfflineQueue] Synced ${synced.length} habit(s)`);
      onSyncedRef.current(synced);
    }
  }, []);

  // Listen for online event to trigger sync
  useEffect(() => {
    window.addEventListener('online', syncQueue);
    // Also try on mount (in case we were offline and just reloaded online)
    if (navigator.onLine && loadQueue().length > 0) {
      syncQueue();
    }
    return () => window.removeEventListener('online', syncQueue);
  }, [syncQueue]);

  // ----------- Add habit (online → direct, offline → queue) -----------
  const addHabit = useCallback(async (title: string): Promise<Habit | null> => {
    if (navigator.onLine) {
      // Direct insert
      const { data, error } = await supabase
        .from('habits')
        .insert([{ title, user_id: session.user.id }])
        .select()
        .single();

      if (error) {
        console.error('[addHabit] error:', error.message);
        return null;
      }
      return data as Habit;
    } else {
      // Offline — queue it locally
      const item: QueuedHabit = {
        id: tempId(),
        title,
        user_id: session.user.id,
        queued_at: new Date().toISOString(),
      };
      const updated = [...loadQueue(), item];
      saveQueue(updated);
      setQueue(updated);
      console.log(`[OfflineQueue] Queued "${title}" for later sync`);
      return null; // caller shows it as optimistic/queued
    }
  }, [session.user.id]);

  return { queue, addHabit, pendingCount: queue.length };
}

export type { QueuedHabit };
