import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { shareHabits } from '../lib/share';
import type { Habit } from '../types';
import { ActionButton } from '../components/ActionButton';
import { AuthScreen } from '../components/AuthScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HabitListScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(supabaseConfigured);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    }).catch(() => setCheckingSession(false));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCheckingSession(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadHabits = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase.from('habits').select('*').order('created_at', { ascending: false });
    if (error) Alert.alert('Could not load habits', error.message);
    else setHabits(data ?? []);
    setLoading(false);
  }, [session]);

  useFocusEffect(useCallback(() => { void loadHabits(); }, [loadHabits]));

  if (checkingSession) {
    return <SafeAreaView className="flex-1 items-center justify-center bg-slate-50"><Text className="text-slate-600">Loading HabitFlow…</Text></SafeAreaView>;
  }
  if (!session) return <AuthScreen />;

  const handleShare = async () => {
    try {
      await shareHabits(habits);
    } catch (error) {
      Alert.alert('Share unavailable', error instanceof Error ? error.message : 'Try again.');
    }
  };

  const removeHabit = (habit: Habit) => {
    Alert.alert('Delete habit?', habit.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const { error } = await supabase.from('habits').delete().eq('id', habit.id).eq('user_id', session.user.id);
        if (error) Alert.alert('Could not delete habit', error.message);
        else setHabits((current) => current.filter((item) => item.id !== habit.id));
      } },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5 pt-5">
      <View className="mb-4 flex-row gap-3">
        <ActionButton label="Add Habit" onPress={() => router.push('/add')} />
        <ActionButton label="Share" onPress={handleShare} secondary />
      </View>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={() => { void loadHabits(); }}
        contentContainerClassName="grow gap-3 pb-8"
        ListEmptyComponent={<Text className="mt-12 text-center text-slate-500">{loading ? 'Loading habits…' : 'No habits yet. Add one to get started.'}</Text>}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <Text className="mr-3 flex-1 text-base font-semibold text-slate-900">{item.title}</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Delete ${item.title}`} onPress={() => removeHabit(item)} className="rounded-lg px-3 py-2">
              <Text className="font-semibold text-rose-700">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
