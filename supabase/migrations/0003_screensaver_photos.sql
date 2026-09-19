-- Screensaver photos: a public-read storage bucket for family photos shown
-- during idle time (see IdleScreensaver). Same project, same pattern as
-- recipe-photos - public read, no public write; uploads go through
-- /api/screensaver-photos using the service role key, gated by the same
-- passcode as the recipe upload page (RECIPE_UPLOAD_PASSCODE) rather than
-- adding a second secret for what is, in spirit, the same "household
-- content upload" permission.

insert into storage.buckets (id, name, public)
values ('screensaver-photos', 'screensaver-photos', true)
on conflict (id) do nothing;

create policy "Screensaver photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'screensaver-photos');
