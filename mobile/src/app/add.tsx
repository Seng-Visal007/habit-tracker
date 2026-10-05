import { useState } from 'react';
import { Alert, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { ActionButton } from '../components/ActionButton';

export default function AddHabitScreen() {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const saveHabit = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle || saving) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Alert.alert('Sign in required', 'Please sign in again to add a habit.');
      setSaving(false);
      return;
    }
    const { error } = await supabase.from('habits').insert({ title: cleanTitle, user_id: session.user.id });
    setSaving(false);
    if (error) Alert.alert('Could not add habit', error.message);
    else router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5 pt-6">
      <Text className="mb-2 text-sm font-semibold text-slate-700">Habit name</Text>
      <TextInput className="mb-5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base" autoFocus placeholder="e.g. Read for 20 minutes" value={title} onChangeText={setTitle} onSubmitEditing={() => { void saveHabit(); }} returnKeyType="done" />
      <ActionButton label={saving ? 'Saving…' : 'Save Habit'} onPress={saveHabit} disabled={!title.trim() || saving} />
    </SafeAreaView>
  );
}
