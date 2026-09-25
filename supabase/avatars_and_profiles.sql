-- ==============================================================================
-- Supabase Storage & Profile Setup for Habit Tracker
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create 'profiles' table if it does not exist
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on public.profiles
alter table public.profiles enable row level security;

-- Profiles policies (drop first so this setup file can safely be re-run)
drop policy if exists "Anyone can view profiles" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Anyone can view profiles"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. Create the public 'avatars' storage bucket with 1MB size limit and image mimes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  1048576, -- 1 MB limit (1024 * 1024 bytes)
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 1048576,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 3. Storage Policies for 'avatars' Bucket
-- Drop existing policies if necessary to avoid conflicts
drop policy if exists "Public Access to Avatars" on storage.objects;
drop policy if exists "Users can upload avatar into own folder" on storage.objects;
drop policy if exists "Users can update avatar in own folder" on storage.objects;
drop policy if exists "Users can delete avatar in own folder" on storage.objects;

-- Policy 1 (SELECT): Public read access for the avatars bucket
create policy "Public Access to Avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Policy 2 (INSERT): Authenticated users can upload only into their own folder (auth.uid() as folder name)
-- Audited: locks the upload path so the first directory in name MUST be auth.uid()::text
create policy "Users can upload avatar into own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3 (UPDATE): Authenticated users can update/replace files only in their own folder
create policy "Users can update avatar in own folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4 (DELETE): Authenticated users can delete files only in their own folder
create policy "Users can delete avatar in own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
