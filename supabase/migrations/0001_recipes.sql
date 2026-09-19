-- Recipe Library: adds a `recipes` table and `recipe-photos` bucket to the
-- existing Wardrobe Edit Supabase project (org Nina, project the-wardrobe-edit,
-- ref ezvmsyneahnprupozorz). Fully separate from that project's existing
-- tables, its `profiles` table, and its per-user magic-link auth — this is a
-- shared household resource with no login concept.
--
-- Run this whole file once in that project's SQL Editor.

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tags text[] not null default '{}',
  servings integer not null default 4,
  yield text,
  prep_time text,
  rise_time text,
  cook_time text,
  oven_temp text,
  ingredients jsonb not null default '[]', -- [{ "item": "flour", "amount": "500", "unit": "g" }, ...]
  method jsonb not null default '[]',      -- ["Preheat the oven...", "Mix the dry ingredients...", ...]
  note text,
  photo_path text,                          -- object path within the recipe-photos bucket
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;

-- Public read: anyone with the anon key can view the household's recipes.
create policy "Recipes are publicly readable"
  on recipes for select
  using (true);

-- No public write policy. Inserts only happen via the passcode-protected
-- upload page's API route, which uses the service role key and bypasses
-- RLS entirely rather than modeling this as a user permission.

insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', true)
on conflict (id) do nothing;

create policy "Recipe photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'recipe-photos');

-- No public insert/update/delete policy on storage.objects either — photo
-- uploads go through the same service-role upload route as the row insert.
