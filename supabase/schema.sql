-- Bookcase database schema
-- Run this in your Supabase SQL Editor

-- Authors table
create table if not exists authors (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- Categories/genres table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamptz default now()
);

-- Books table (shared across all users)
-- isbn_13 is the primary lookup key (universal standard)
-- google_book_id is a fallback for books without ISBN (~15% of results)
create table if not exists books (
  id uuid default gen_random_uuid() primary key,
  isbn_13 text unique,
  isbn_10 text,
  title text not null,
  page_count integer default 0,
  thumbnail text,
  description text,
  published_date text,
  language text,
  google_book_id text,
  created_at timestamptz default now()
);

-- Book-Author relationship (many-to-many)
create table if not exists book_authors (
  book_id uuid references books(id) on delete cascade not null,
  author_id uuid references authors(id) on delete cascade not null,
  primary key (book_id, author_id)
);

-- Book-Category relationship (many-to-many)
create table if not exists book_categories (
  book_id uuid references books(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  primary key (book_id, category_id)
);

-- User's relationship with books
create table if not exists user_books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id uuid references books(id) on delete cascade not null,
  status text check (status in ('want_to_read', 'reading', 'read')) default 'want_to_read',
  pages_read integer default 0,
  rating smallint check (rating is null or (rating >= 1 and rating <= 5)),
  notes text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(user_id, book_id)
);

-- Indexes for performance
create index if not exists idx_books_isbn_13 on books(isbn_13);
create index if not exists idx_books_google_book_id on books(google_book_id);
create index if not exists idx_user_books_user_id on user_books(user_id);
create index if not exists idx_user_books_status on user_books(user_id, status);
create index if not exists idx_book_authors_author on book_authors(author_id);
create index if not exists idx_book_categories_category on book_categories(category_id);

-- Enable Row Level Security
alter table books enable row level security;
alter table authors enable row level security;
alter table categories enable row level security;
alter table book_authors enable row level security;
alter table book_categories enable row level security;
alter table user_books enable row level security;

-- Books, authors, categories are readable by all authenticated users
create policy "Anyone can view books" on books
  for select using (auth.role() = 'authenticated');

create policy "Anyone can insert books" on books
  for insert with check (auth.role() = 'authenticated');

create policy "Anyone can view authors" on authors
  for select using (auth.role() = 'authenticated');

create policy "Anyone can insert authors" on authors
  for insert with check (auth.role() = 'authenticated');

create policy "Anyone can view categories" on categories
  for select using (auth.role() = 'authenticated');

create policy "Anyone can insert categories" on categories
  for insert with check (auth.role() = 'authenticated');

create policy "Anyone can view book_authors" on book_authors
  for select using (auth.role() = 'authenticated');

create policy "Anyone can insert book_authors" on book_authors
  for insert with check (auth.role() = 'authenticated');

create policy "Anyone can view book_categories" on book_categories
  for select using (auth.role() = 'authenticated');

create policy "Anyone can insert book_categories" on book_categories
  for insert with check (auth.role() = 'authenticated');

-- User books: users can only access their own
create policy "Users can view own books" on user_books
  for select using (auth.uid() = user_id);

create policy "Users can insert own books" on user_books
  for insert with check (auth.uid() = user_id);

create policy "Users can update own books" on user_books
  for update using (auth.uid() = user_id);

create policy "Users can delete own books" on user_books
  for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_books_updated_at
  before update on user_books
  for each row execute function update_updated_at();
