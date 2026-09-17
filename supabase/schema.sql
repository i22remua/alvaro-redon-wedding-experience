-- Ejecuta todo este archivo en Supabase > SQL Editor > New query > Run.

create extension if not exists pgcrypto;

create table if not exists public.wedding_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  wedding_date date not null,
  venue text,
  address text,
  ceremony_time time,
  cocktail_time time,
  banquet_time time,
  open_bar_time time,
  guest_count integer check (guest_count is null or guest_count >= 0),
  couple_names text not null,

  contracted_extras text,
  wedding_planner text,

  guests_family_older integer check (guests_family_older is null or guests_family_older between 0 and 100),
  guests_20_50 integer check (guests_20_50 is null or guests_20_50 between 0 and 100),
  guests_young integer check (guests_young is null or guests_young between 0 and 100),

  must_play text,
  avoid_songs text,
  style_preferences jsonb not null default '{}'::jsonb,

  dj_microphone text,
  special_moments text,
  favorite_artists text,
  spotify_playlist text,
  last_song text,
  details text
);

alter table public.wedding_responses enable row level security;

-- Cualquiera que tenga el enlace puede ENVIAR el cuestionario,
-- pero un visitante anónimo NO puede leer las respuestas.
drop policy if exists "public can insert wedding responses" on public.wedding_responses;
create policy "public can insert wedding responses"
on public.wedding_responses
for insert
to anon, authenticated
with check (true);

-- Solo usuarios autenticados de Supabase pueden LEER las respuestas.
-- Para este proyecto, desactiva los registros públicos y crea solamente tu usuario administrador.
drop policy if exists "authenticated can read wedding responses" on public.wedding_responses;
create policy "authenticated can read wedding responses"
on public.wedding_responses
for select
to authenticated
using (true);

-- No se crean políticas de UPDATE/DELETE: desde la web no se puede modificar ni borrar nada.
