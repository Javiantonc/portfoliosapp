-- Compras Premium registradas por el webhook de Stripe
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  product text not null check (product in ('bundle', 'portfolio')),
  amount integer,
  currency text,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "own purchases" on public.purchases
  for select using (auth.uid() = user_id);
