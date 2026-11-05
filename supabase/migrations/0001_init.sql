create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Mi CV',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.portfolios (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null unique references public.resumes(id) on delete cascade,
  slug text not null unique,
  theme text not null default 'stage',
  published boolean not null default false
);

alter table public.resumes enable row level security;
alter table public.portfolios enable row level security;

create policy "own resumes" on public.resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own portfolios" on public.portfolios
  for all using (exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid()));

create policy "public portfolios" on public.portfolios
  for select using (published);

create policy "public resume via portfolio" on public.resumes
  for select using (exists (select 1 from public.portfolios p where p.resume_id = id and p.published));

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "avatar upload own folder" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
