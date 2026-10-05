import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTintColor: '#6d28d9', headerTitleStyle: { fontWeight: '700' } }}>
        <Stack.Screen name="index" options={{ title: 'My Habits' }} />
        <Stack.Screen name="add" options={{ title: 'Add a Habit' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
