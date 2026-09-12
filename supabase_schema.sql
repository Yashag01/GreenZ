-- 1. Create a table for public profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  name text,
  company_name text,
  factory_location text, -- e.g., "Gujarat, India"
  factory_type text,     -- e.g., "solar_and_wind"
  team_members jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 3. Automatically create a profile when a new user signs up
-- This uses a PostgreSQL trigger to insert a row into public.profiles whenever a new user is created in auth.users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, company_name, factory_location, factory_type)
  values (
    new.id, 
    new.email, 
    'Demo Factory Owner', 
    'Flux Energy Solutions', 
    'Gujarat, India', 
    'solar_and_wind'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
