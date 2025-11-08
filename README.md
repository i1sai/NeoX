NeoX — Training Session Tracker
================================

NeoX lets a registered user keep track of group workouts, including duration, calories burned, intensity, and the program/source that supplied the data. The profile page stores height, weight, and goal so the user can see a quick BMI estimate.

## Tech Stack
- Next.js 14 (React 18) with **TypeScript** for all pages and components
- Plain **CSS** via a global stylesheet for layout and styling
- Firebase Authentication (email/password) for secure login and signup
- Supabase REST API (PostgREST) for CRUD and Row Level Security on session/profile data

## Quick Setup
1. Install packages
   ```bash
   npm install
   ```
2. Create `.env.local` (copy from `.env.local.example`) and fill in the Firebase and Supabase values.
3. Development server
   ```bash
   npm run dev
   ```
4. Production build
   ```bash
   npm run build
   npm start
   ```

## Firebase (Auth)
- Create/choose a Firebase project.
- Register a web app and copy `apiKey`, `authDomain`, `projectId`, `appId` into `.env.local`.
- Enable Email/Password sign-in under Authentication.

## Supabase (Data)
- Create a project and copy the REST URL + anon key into `.env.local`.
- Run this once in the SQL editor:
  ```sql
  create table if not exists sessions (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    title text not null,
    date date not null,
    duration int4 not null,
    calories_burned int4,
    intensity text,
    source text,
    description text,
    created_at timestamptz default now()
  );

  create table if not exists profiles (
    user_id text primary key,
    height_cm int4,
    weight_kg int4,
    goal text,
    updated_at timestamptz default now()
  );

  alter table sessions enable row level security;
  alter table profiles enable row level security;

  drop policy if exists "Users view own sessions" on sessions;
  drop policy if exists "Users insert own sessions" on sessions;
  drop policy if exists "Users update own sessions" on sessions;
  drop policy if exists "Users delete own sessions" on sessions;

  drop policy if exists "Users view own profile" on profiles;
  drop policy if exists "Users upsert own profile" on profiles;

  create policy "Users view own sessions"
    on sessions for select using (user_id = current_setting('request.headers', true)::json->>'x-user-id');
  create policy "Users insert own sessions"
    on sessions for insert with check (user_id = current_setting('request.headers', true)::json->>'x-user-id');
  create policy "Users update own sessions"
    on sessions for update using (user_id = current_setting('request.headers', true)::json->>'x-user-id')
    with check (user_id = current_setting('request.headers', true)::json->>'x-user-id');
  create policy "Users delete own sessions"
    on sessions for delete using (user_id = current_setting('request.headers', true)::json->>'x-user-id');

  create policy "Users view own profile"
    on profiles for select using (user_id = current_setting('request.headers', true)::json->>'x-user-id');
  create policy "Users upsert own profile"
    on profiles for all using (user_id = current_setting('request.headers', true)::json->>'x-user-id')
    with check (user_id = current_setting('request.headers', true)::json->>'x-user-id');
  ```

## Features
- Sign up / log in (redirects straight to sessions).
- `/sessions`: list workouts, add via quick presets (HIIT, Strength, Conditioning) and one-click duration/calorie picks, edit, delete.
- `/profile`: store height, weight, goal (preset list + custom option) and view BMI estimate.

## API Environment Variables
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

================================
