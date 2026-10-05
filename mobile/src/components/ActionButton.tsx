import { Text, TouchableOpacity } from 'react-native';

export function ActionButton({ label, onPress, secondary = false, disabled = false }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return (
    <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} className={`flex-1 items-center rounded-xl px-4 py-3 ${secondary ? 'border border-violet-300 bg-white' : 'bg-violet-700'} ${disabled ? 'opacity-50' : ''}`}>
      <Text className={`font-bold ${secondary ? 'text-violet-800' : 'text-white'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
