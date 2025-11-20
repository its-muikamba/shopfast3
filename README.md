
# ShopFast Restaurant Mode - Production Integration Guide

## 1. Executive Summary

This document outlines the roadmap for converting the **ShopFast Restaurant Mode** frontend prototype into a robust full-stack application.

---

## 2. Supabase Integration (Fastest Method)

We have implemented a "Hybrid Sync" engine that allows you to use **Supabase** as your backend.

**Why this specific Schema?**
The current application state is complex and nested. Instead of creating 15 relational tables (which would require rewriting the frontend logic significantly), we use PostgreSQL's `JSONB` columns. This allows us to store the application state exactly as it exists in React, while still getting the security and real-time backups of a database.

### Setup Instructions

1.  **Create Project:** Go to [database.new](https://database.new) and create a new Supabase project.
2.  **Get Keys:** Go to **Project Settings -> API**. Copy `URL` and `anon public` Key.
3.  **Configure App:** Open `services/supabase.ts` and paste your keys.
4.  **Run SQL:** Go to the **SQL Editor** in Supabase and copy-paste the code block below.

### SQL Schema (Run this to Fix "Column data does not exist" errors)

This script will **RESET** your tables to the correct format required by the app.

```sql
-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Drop existing tables to fix any schema mismatches
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Create "Bucket" Tables that match React State
-- We use 'jsonb' to store the complex arrays (Restaurants, Menus, etc) directly.

create table restaurants (
  id text primary key, -- We will use 'global_state' as the ID for the singleton array
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table menus (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table orders (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table staff (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table alerts (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table transactions (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table users (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
-- For this phase, we allow public access so the demo works instantly.

alter table restaurants enable row level security;
create policy "Public Access" on restaurants for all using (true) with check (true);

alter table menus enable row level security;
create policy "Public Access" on menus for all using (true) with check (true);

alter table orders enable row level security;
create policy "Public Access" on orders for all using (true) with check (true);

alter table staff enable row level security;
create policy "Public Access" on staff for all using (true) with check (true);

alter table alerts enable row level security;
create policy "Public Access" on alerts for all using (true) with check (true);

alter table transactions enable row level security;
create policy "Public Access" on transactions for all using (true) with check (true);

alter table users enable row level security;
create policy "Public Access" on users for all using (true) with check (true);
```

---

## 3. Firebase Integration (Alternative)

See `services/firebase.ts` for details on how to use Firebase Firestore instead.

---

## 4. Frontend Production Migration

To remove the "cdn.tailwindcss.com" warning:

1.  **Install Tailwind:**
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```

2.  **Configure `tailwind.config.js`:** Copy the config from `index.html` into this file.

3.  **Add `index.css`:**
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

4.  **Import CSS:** Add `import './index.css'` to `index.tsx`.
