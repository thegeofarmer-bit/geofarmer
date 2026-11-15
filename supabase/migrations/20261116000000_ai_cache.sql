create table public.ai_cache (
  cache_key       text primary key,
  kind            text not null check (kind in ('advice', 'chat')),
  parcel_id       text references public.farm_parcels (parcel_id) on delete cascade,
  model           text not null,
  prompt_version  text not null,
  source          text not null check (source in ('ai', 'rules')),
  content         jsonb not null,
  neurons         numeric not null default 0,
  created_at      timestamptz not null default now()
);
create index ai_cache_created_idx on public.ai_cache (created_at);

alter table public.ai_cache enable row level security;
