create table if not exists word_of_the_day (
  id serial primary key,
  word text not null,
  date date not null unique default current_date,
  created_at timestamptz not null default now()
);

-- Allow anyone to read (no auth required for WOTD)
alter table word_of_the_day enable row level security;
create policy "Anyone can read word of the day"
  on word_of_the_day for select
  using (true);

-- Only service role can insert (edge function uses service key)
create policy "Service role can insert word of the day"
  on word_of_the_day for insert
  with check (true);
