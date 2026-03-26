# Bookcase

Book tracking app — track your reads, pages, and reading stats.

Part of [crowdshipped.dev](https://crowdshipped.dev)

Live at: [bookcase.crowdshipped.dev](https://bookcase.crowdshipped.dev)

## Tech Stack

- React + Vite
- Supabase (Auth + Database)
- Google Books API
- Cloudflare Pages

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL from `supabase/schema.sql` in the Supabase SQL editor
3. Enable Google Auth in Supabase → Authentication → Providers
4. Copy `.env.example` to `.env` and fill in your Supabase credentials
5. `npm install && npm run dev`
