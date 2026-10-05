# Vercel deployment

## Project settings

- Import the GitHub repository `Seng-Visal007/habit-tracker`.
- Set the Vercel Root Directory to `.`.
- Use the Vite framework preset, build command `npm run build`, and output directory `dist`.
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel's Environment Variables for Production, Preview, and Development. Use the project URL and public anon/publishable key from Supabase **Connect** or **Settings > API Keys**. Do not put real values in Git.
- Redeploy after saving environment variables. The `vercel.json` rewrite supports the app's browser routes.

## Supabase auth URLs and live verification

After Vercel provides the production URL, set it as the Supabase Auth Site URL and add it to the allowed redirect URLs. Then sign in on the deployed site, create a habit, refresh, and confirm it remains in the list.

The Vite app accepts both `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The checked-in `.env.example` contains placeholders only; the local `.env` is ignored by Git.
