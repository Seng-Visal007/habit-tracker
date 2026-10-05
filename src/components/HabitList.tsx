import { useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Habit } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { useOfflineQueue, type QueuedHabit } from '@/hooks/useOfflineQueue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  ListTodo,
  Loader2,
  Sparkles,
  Share2,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface HabitListProps {
  session: Session;
  habits: Habit[];
  loading: boolean;
  onHabitsChange: (habits: Habit[]) => void;
  shouldCrash?: boolean;
}

export function HabitList({
  session,
  habits,
  loading,
  onHabitsChange,
  shouldCrash = false,
}: HabitListProps) {
  const [newTitle, setNewTitle] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');

  // Deliberate crash guard for ErrorBoundary audit testing
  if (shouldCrash) {
    throw new Error('Simulated runtime failure in Habit List (Audit Checklist Test)');
  }

  // Offline queue — adds habits locally when offline, syncs on reconnect
  const { queue, addHabit, pendingCount } = useOfflineQueue(session, (synced) => {
    // Merge newly-synced habits into the top of the list
    onHabitsChange([...synced, ...habits]);
  });

  // Add a new habit (online: direct, offline: queued)
  const handleAddHabit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      if (navigator.onLine) {
        const data = await addHabit(trimmed);
        if (data) {
          onHabitsChange([data, ...habits]);
          setNewTitle('');
        }
      } else {
        // Queued offline — show optimistic UI feedback
        await addHabit(trimmed);
        setNewTitle('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a habit
  const handleDeleteHabit = async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) {
      alert(error.message);
    } else {
      onHabitsChange(habits.filter((h) => h.id !== id));
    }
  };

  // Update a habit title
  const handleUpdateHabit = async (id: string) => {
    const trimmed = editTitle.trim();
    if (!trimmed) return;

    const { error } = await supabase
      .from('habits')
      .update({ title: trimmed })
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      onHabitsChange(
        habits.map((h) => (h.id === id ? { ...h, title: trimmed } : h))
      );
      setEditingId(null);
    }
  };

  // Share button — Web Share API with clipboard fallback
  const handleShare = async () => {
    const text = [
      `🎯 My HabitFlow – ${habits.length} habit${habits.length !== 1 ? 's' : ''} tracked!`,
      '',
      ...habits.slice(0, 5).map((h) => `• ${h.title}`),
      habits.length > 5 ? `…and ${habits.length - 5} more` : '',
      '',
      'Try HabitFlow: build momentum, one habit at a time.',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (navigator.share) {
        await navigator.share({ title: 'My HabitFlow Habits', text });
        setShareStatus('shared');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setShareStatus('copied');
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.append(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (copied) setShareStatus('copied');
      }
    } catch {
      // User dismissed share sheet — not an error
    }
    setTimeout(() => setShareStatus('idle'), 2500);
  };

  return (
    <Card className="shadow-sm border-border/80">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold text-foreground">
            My Daily Habits
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {/* Pending sync badge */}
          {pendingCount > 0 && (
            <span
              title={`${pendingCount} habit${pendingCount !== 1 ? 's' : ''} queued for sync`}
              className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full"
            >
              <Clock className="h-3 w-3" />
              {pendingCount} queued
            </span>
          )}
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {habits.length} {habits.length === 1 ? 'habit' : 'habits'}
          </span>
          {/* Share button */}
          {habits.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleShare}
              title={shareStatus === 'copied' ? 'Copied!' : shareStatus === 'shared' ? 'Shared!' : 'Share your habits'}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {shareStatus !== 'idle' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Habit Addition Form */}
        <form onSubmit={handleAddHabit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new habit (e.g. Read 20 mins, Morning run)..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 min-w-0"
          />
          <Button type="submit" disabled={isSubmitting || !newTitle.trim()} className="gap-1.5 shrink-0">
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Add</span>
          </Button>
        </form>

        {/* Offline queued habits — shown at top with a pending badge */}
        {queue.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600/80">
              Pending sync
            </p>
            {queue.map((item: QueuedHabit) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3.5 border border-dashed border-amber-400/40 rounded-xl bg-amber-500/5 text-amber-800 dark:text-amber-300"
              >
                <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="text-sm font-medium flex-1 truncate">{item.title}</span>
                <span className="text-[10px] text-amber-500/70 shrink-0">offline</span>
              </div>
            ))}
          </div>
        )}

        {/* Habit Items or State Message */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">Loading your habits...</span>
          </div>
        ) : habits.length === 0 && queue.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed rounded-xl bg-muted/20">
            <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">No habits created yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Start your journey by adding your first daily habit above!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3.5 border rounded-xl bg-card text-card-foreground shadow-xs hover:border-border transition-all"
              >
                {editingId === habit.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-2 animate-in fade-in-50">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 h-9 text-sm"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleUpdateHabit(habit.id)}
                      title="Save change"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      title="Cancel"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">
                        {habit.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(habit.id);
                          setEditTitle(habit.title);
                        }}
                        title="Edit habit"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteHabit(habit.id)}
                        title="Delete habit"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
