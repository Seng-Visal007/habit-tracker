# HabitFlow Mobile

Expo port of the habit list, using the same Supabase project and authenticated user's rows.

## Start

1. Copy `.env.example` to `.env` and fill in `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from Supabase.
2. Run `npm install` once, then `npx expo start` from this directory.
3. Open the QR code with Expo Go on a phone, or press `a` to launch an Android emulator.

The app has Sign In/Sign Up, a `FlatList` habits screen, and an Add screen navigated by Expo Router. Supabase sessions persist with AsyncStorage. The share handler uses `Platform.select`: Web Share/clipboard APIs are isolated in its web callback; native uses React Native `Share.share`.
