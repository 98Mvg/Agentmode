-- Supabase marketing asset storage setup.
-- Run this only in the separate `coachi-marketing-assets` Supabase project.
-- Do not run this in the Coachi app Supabase project.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'slideshow-public',
    'slideshow-public',
    true,
    104857600,
    array[
      'image/png',
      'image/jpeg',
      'image/webp',
      'video/mp4',
      'application/json'
    ]
  ),
  (
    'slideshow-private',
    'slideshow-private',
    false,
    104857600,
    array[
      'image/png',
      'image/jpeg',
      'image/webp',
      'video/mp4',
      'text/plain',
      'text/markdown',
      'application/json'
    ]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.marketing_asset_objects (
  id bigint generated always as identity primary key,
  campaign_date date not null,
  slug text not null,
  platform text,
  asset_role text not null,
  bucket_id text not null,
  object_path text not null,
  content_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  sha256 text not null check (length(sha256) = 64),
  source_tool text not null default 'codex',
  created_at timestamptz not null default now(),
  constraint marketing_asset_objects_bucket_check
    check (bucket_id in ('slideshow-public', 'slideshow-private')),
  constraint marketing_asset_objects_platform_check
    check (
      platform is null
      or platform in ('tiktok', 'instagram', 'x', 'reddit', 'shared')
    )
);

create unique index if not exists marketing_asset_objects_bucket_path_uidx
  on public.marketing_asset_objects (bucket_id, object_path);

create index if not exists marketing_asset_objects_campaign_idx
  on public.marketing_asset_objects (campaign_date desc, slug);

create index if not exists marketing_asset_objects_platform_idx
  on public.marketing_asset_objects (platform, campaign_date desc)
  where platform is not null;

alter table public.marketing_asset_objects enable row level security;

-- Keep metadata service-role only by default.
-- Supabase service role bypasses RLS for local marketing automation.
-- Add explicit authenticated policies later only if a real dashboard needs them.

revoke all on table public.marketing_asset_objects from anon;
revoke all on table public.marketing_asset_objects from authenticated;

comment on table public.marketing_asset_objects is
  'Marketing-only asset upload manifest. Isolated from the Coachi app runtime.';

comment on column public.marketing_asset_objects.bucket_id is
  'Supabase storage bucket. Use slideshow-public for approved assets and slideshow-private for sources.';
