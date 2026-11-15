create extension if not exists postgis with schema extensions;

create table public.datasets (
  dataset_id    text primary key,
  name          text not null,
  source        text not null,
  is_simulated  boolean not null default false,
  period_start  date,
  period_end    date,
  resolution_m  numeric,
  units         text,
  notes         text
);

create table public.farmers (
  farmer_id         text primary key,
  farmer_name       text not null,
  community         text,
  preferred_crops   text,
  is_simulated      boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.crop_reference (
  crop_id             text primary key,
  crop_name           text not null unique,
  crop_family         text not null,
  crop_duration_days  integer not null check (crop_duration_days > 0),
  optimal_temp_min_c  numeric not null,
  optimal_temp_max_c  numeric not null,
  optimal_ph_min      numeric not null,
  optimal_ph_max      numeric not null,
  water_requirement   text not null check (water_requirement in ('Low', 'Moderate', 'High')),
  drought_tolerance   text not null check (drought_tolerance in ('Low', 'Moderate', 'High')),
  nitrogen_fixing     boolean not null,
  nutrient_demand     text not null check (nutrient_demand in ('Low', 'Moderate', 'High')),
  check (optimal_temp_min_c <= optimal_temp_max_c),
  check (optimal_ph_min <= optimal_ph_max)
);

create table public.farm_parcels (
  parcel_id          text primary key,
  farmer_id          text references public.farmers (farmer_id) on update cascade on delete set null,
  community          text,
  farm_area_ha       numeric,
  soil_type          text,
  irrigation_status  text,
  farm_status        text,
  remarks            text,
  geom               extensions.geometry (MultiPolygon, 4326),
  is_simulated       boolean not null default true
);
create index farm_parcels_geom_idx on public.farm_parcels using gist (geom);
create index farm_parcels_farmer_idx on public.farm_parcels (farmer_id);

create sequence public.crop_season_seq;

create table public.crop_seasons (
  season_id              text primary key default ('S' || lpad(nextval('public.crop_season_seq')::text, 4, '0')),
  parcel_id              text not null references public.farm_parcels (parcel_id) on update cascade,
  crop_id                text not null references public.crop_reference (crop_id) on update cascade,
  season_name            text not null check (season_name in ('Major', 'Minor')),
  season_year            integer not null,
  planting_date          date not null,
  expected_harvest_date  date,
  actual_harvest_date    date,
  crop_variety           text,
  crop_status            text not null default 'Growing'
                         check (crop_status in ('Planned', 'Growing', 'Harvested', 'Failed')),
  planting_method        text check (planting_method in ('Rows', 'Broadcast', 'Mounds', 'Ridges')),
  is_simulated           boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  check (expected_harvest_date is null or expected_harvest_date >= planting_date),
  check (actual_harvest_date is null or actual_harvest_date >= planting_date)
);
create index crop_seasons_parcel_idx on public.crop_seasons (parcel_id, planting_date desc);

create table public.crop_season_corrections (
  correction_id  bigint generated always as identity primary key,
  season_id      text not null references public.crop_seasons (season_id),
  previous       jsonb not null,
  corrected_at   timestamptz not null default now(),
  reason         text
);

create table public.parcel_environment (
  environment_id  text primary key,
  parcel_id       text not null references public.farm_parcels (parcel_id) on update cascade on delete cascade,
  variable        text not null,
  value           numeric not null,
  unit            text,
  dataset_id      text not null references public.datasets (dataset_id),
  method          text,
  unique (parcel_id, variable, dataset_id)
);
create index parcel_environment_parcel_idx on public.parcel_environment (parcel_id);

create table public.moisture_class_distribution (
  parcel_id       text not null references public.farm_parcels (parcel_id) on update cascade on delete cascade,
  moisture_class  smallint not null,
  cell_count      integer not null,
  total_cells     integer not null,
  class_percent   numeric not null,
  primary key (parcel_id, moisture_class)
);

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;
create trigger farmers_touch before update on public.farmers for each row execute function public.touch_updated_at();
create trigger crop_seasons_touch before update on public.crop_seasons for each row execute function public.touch_updated_at();

create view public.parcel_overview with (security_invoker = true) as
select
  p.parcel_id,
  p.farmer_id,
  f.farmer_name,
  p.community,
  p.farm_area_ha,
  p.is_simulated,
  p.geom is not null as has_geometry,
  extensions.st_asgeojson(p.geom, 6)::jsonb as geometry,
  extensions.st_x(extensions.st_centroid(p.geom)) as centroid_lon,
  extensions.st_y(extensions.st_centroid(p.geom)) as centroid_lat,
  ls.season_id as latest_season_id,
  ls.crop_id as latest_crop_id,
  c.crop_name as latest_crop_name,
  ls.crop_status as latest_crop_status,
  ls.planting_date as latest_planting_date
from public.farm_parcels p
left join public.farmers f on f.farmer_id = p.farmer_id
left join lateral (
  select s.* from public.crop_seasons s
  where s.parcel_id = p.parcel_id
  order by s.planting_date desc, s.created_at desc
  limit 1
) ls on true
left join public.crop_reference c on c.crop_id = ls.crop_id;

alter table public.datasets enable row level security;
alter table public.farmers enable row level security;
alter table public.crop_reference enable row level security;
alter table public.farm_parcels enable row level security;
alter table public.crop_seasons enable row level security;
alter table public.crop_season_corrections enable row level security;
alter table public.parcel_environment enable row level security;
alter table public.moisture_class_distribution enable row level security;

create policy "public read" on public.datasets for select using (true);
create policy "public read" on public.farmers for select using (true);
create policy "public read" on public.crop_reference for select using (true);
create policy "public read" on public.farm_parcels for select using (true);
create policy "public read" on public.crop_seasons for select using (true);
create policy "public read" on public.parcel_environment for select using (true);
create policy "public read" on public.moisture_class_distribution for select using (true);
