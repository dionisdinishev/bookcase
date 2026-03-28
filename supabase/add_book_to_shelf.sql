-- Single RPC to add a book to a user's shelf
-- Handles: find/create book, find/create authors & categories, link them, create user_book
-- Run this in your Supabase SQL Editor

create or replace function add_book_to_shelf(
  p_user_id uuid,
  p_status text default 'want_to_read',
  p_isbn_13 text default null,
  p_isbn_10 text default null,
  p_title text default 'Unknown Title',
  p_page_count integer default 0,
  p_thumbnail text default null,
  p_description text default null,
  p_published_date text default null,
  p_language text default null,
  p_google_book_id text default null,
  p_authors text[] default '{}',
  p_categories text[] default '{}'
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_book_id uuid;
  v_author_id uuid;
  v_category_id uuid;
  v_user_book_id uuid;
  v_name text;
begin
  -- 1. Find or create book
  if p_isbn_13 is not null then
    select id into v_book_id from books where isbn_13 = p_isbn_13;
  end if;

  if v_book_id is null and p_google_book_id is not null then
    select id into v_book_id from books where google_book_id = p_google_book_id;
  end if;

  if v_book_id is null then
    insert into books (isbn_13, isbn_10, title, page_count, thumbnail, description, published_date, language, google_book_id)
    values (p_isbn_13, p_isbn_10, p_title, p_page_count, p_thumbnail, p_description, p_published_date, p_language, p_google_book_id)
    returning id into v_book_id;

    -- 2. Find or create authors and link them
    foreach v_name in array p_authors loop
      insert into authors (name) values (v_name)
      on conflict (name) do update set name = excluded.name
      returning id into v_author_id;

      insert into book_authors (book_id, author_id)
      values (v_book_id, v_author_id)
      on conflict do nothing;
    end loop;

    -- 3. Find or create categories and link them
    foreach v_name in array p_categories loop
      insert into categories (name) values (v_name)
      on conflict (name) do update set name = excluded.name
      returning id into v_category_id;

      insert into book_categories (book_id, category_id)
      values (v_book_id, v_category_id)
      on conflict do nothing;
    end loop;
  end if;

  -- 4. Add to user's shelf
  insert into user_books (user_id, book_id, status, pages_read)
  values (p_user_id, v_book_id, p_status, 0)
  on conflict (user_id, book_id) do update set status = excluded.status
  returning id into v_user_book_id;

  return v_user_book_id;
end;
$$;
