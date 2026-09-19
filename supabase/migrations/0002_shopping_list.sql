-- Shopping list: a shared, checkable household list, generated from recipe
-- ingredients (see the Recipes panel's "Add to shopping list" button) or
-- added by hand. Same Supabase project as `recipes`, fully separate table.
--
-- Unlike `recipes` (public read, write only via the service role), this
-- table is public read/write - there's no passcode gate here, since a
-- shopping list is meant to be checked off and added to directly from the
-- dashboard using nothing but the anon key, the same way every other
-- per-device setting in this app has no server-side auth.

create table if not exists shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  amount text not null default '',
  unit text not null default '',
  checked boolean not null default false,
  source_recipe_id uuid references recipes(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table shopping_list_items enable row level security;

create policy "Shopping list is publicly readable"
  on shopping_list_items for select
  using (true);

create policy "Shopping list is publicly writable"
  on shopping_list_items for all
  using (true)
  with check (true);
