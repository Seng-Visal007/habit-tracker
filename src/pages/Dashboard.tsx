import { useState, useEffect, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Habit } from '@/types/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Check, X, LogOut, Plus } from 'lucide-react';

interface DashboardProps {
  session: Session;
}

export default function Dashboard({ session }: DashboardProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');

  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error(error.message);
      else setHabits(data || []);
      setLoading(false);
    };

    fetchHabits();
  }, []);

  const addHabit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    const { data, error } = await supabase
      .from('habits')
      .insert([{ title, user_id: session.user.id }])
      .select();

    if (error) alert(error.message);
    else if (data) {
      setHabits([data[0], ...habits]);
      setTitle('');
    }
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) alert(error.message);
    else setHabits(habits.filter((h) => h.id !== id));
  };

  const updateHabit = async (id: string) => {
    const { error } = await supabase
      .from('habits')
      .update({ title: editTitle })
      .eq('id', id);

    if (error) alert(error.message);
    else {
      setHabits(habits.map((h) => (h.id === id ? { ...h, title: editTitle } : h)));
      setEditingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-2xl font-bold">Habit Tracker</CardTitle>
          <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={addHabit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a new habit..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button type="submit">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </form>

          {loading ? (
            <p className="text-center text-muted-foreground py-4">Loading your habits...</p>
          ) : habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No habits created yet.</p>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card text-card-foreground shadow-sm"
                >
                  {editingId === habit.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="icon" variant="ghost" onClick={() => updateHabit(habit.id)}>
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{habit.title}</span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(habit.id);
                            setEditTitle(habit.title);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteHabit(habit.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
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
    </div>
  );
}