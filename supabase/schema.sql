create extension if not exists pgcrypto;

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  game text not null,
  format text not null default 'Single Elimination',
  description text,
  starts_at timestamptz not null,
  status text not null default 'upcoming' check (status in ('upcoming','live','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.tournaments enable row level security;
create policy "published tournaments are readable" on public.tournaments for select using (true);

-- Optional starter event.
insert into public.tournaments (name, game, format, description, starts_at)
select 'Community Opening Cup', 'Your Game', 'Single Elimination', 'Create and edit your events from Supabase.', now() + interval '7 days'
where not exists (select 1 from public.tournaments);
