import { Platform, Share } from 'react-native';
import type { Habit } from '../types';

const shareText = (habits: Habit[]) => [
  `My HabitFlow — ${habits.length} habit${habits.length === 1 ? '' : 's'} tracked!`,
  ...habits.map((habit) => `• ${habit.title}`),
].join('\n');

const shareForPlatform = Platform.select({
  web: async (message: string) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: 'My HabitFlow habits', text: message });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
    } else {
      throw new Error('Sharing is not available in this browser.');
    }
  },
  default: async (message: string) => {
    await Share.share({ message });
  },
});

export function shareHabits(habits: Habit[]) {
  const message = shareText(habits);
  return shareForPlatform?.(message);
}
