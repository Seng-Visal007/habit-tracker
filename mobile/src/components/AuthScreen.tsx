import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { ActionButton } from './ActionButton';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingUp, setSigningUp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (!supabaseConfigured) {
      setMessage('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env first.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const result = signingUp
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (signingUp && !result.data.session) setMessage('Check your email to confirm your account, then sign in.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not authenticate. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center bg-slate-50 px-6">
      <View>
        <Text className="mb-2 text-3xl font-bold text-slate-900">HabitFlow</Text>
        <Text className="mb-8 text-base text-slate-600">{signingUp ? 'Create an account to sync your habits.' : 'Sign in to see your habits.'}</Text>
        {!supabaseConfigured && <Text className="mb-4 rounded-xl bg-amber-100 p-3 text-amber-900">Set the Supabase environment variables in mobile/.env.</Text>}
        <TextInput className="mb-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base" autoCapitalize="none" keyboardType="email-address" placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput className="mb-4 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base" placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        {!!message && <Text accessibilityLiveRegion="polite" className="mb-4 text-sm text-rose-700">{message}</Text>}
        <ActionButton label={busy ? 'Please wait…' : signingUp ? 'Sign Up' : 'Sign In'} onPress={submit} disabled={busy} />
        <TouchableOpacity className="mt-5 items-center py-2" onPress={() => { setSigningUp(!signingUp); setMessage(''); }}>
          <Text className="font-semibold text-violet-700">{signingUp ? 'Already have an account? Sign In' : 'New here? Create an account'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
