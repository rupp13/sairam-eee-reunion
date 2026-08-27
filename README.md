# Sai Ram EEE 25 Year Reunion — site

A rebuild of the reunion site (originally on Framer) as a plain Next.js app,
ready to deploy on Vercel for free.

## What's included

- `/` — home page with event details, venue, and schedule
- `/rsvp` — RSVP form (posts to `/api/rsvp`)
- `/rsvp-list` — list of everyone who has RSVP'd
- `/api/rsvp` — serverless API route that saves RSVPs to Postgres

## 1. Get a free Postgres database

Any of these work and have a free tier:

- **Vercel Postgres** — from your Vercel project, go to
  **Storage -> Create Database -> Postgres**. It wires up the
  `DATABASE_URL` env var for you automatically.
- **Neon** (neon.tech) — create a project, copy the connection string.
- **Supabase** (supabase.com) — create a project, copy the connection
  string from Project Settings -> Database.

The app creates its own `rsvps` table automatically the first time it runs
— no manual migration needed.

## 2. Deploy to Vercel

    npm install -g vercel   # if you don't have it
    vercel

Or push this folder to a GitHub repo and import it at vercel.com/new.

## 3. Set the environment variable

In your Vercel project settings -> Environment Variables, add:

    DATABASE_URL=<your connection string>

(If you used Vercel Postgres from step 1, this is already set for you.)
Redeploy after adding it.

## Local development

    npm install
    cp .env.example .env.local   # then fill in DATABASE_URL
    npm run dev

## Notes

- The hero and venue photos are still loaded from the original Framer CDN
  (framerusercontent.com), which is public and fine to hotlink — but if
  you'd rather fully own the assets, download those images and drop them
  in /public, then update the src paths in app/page.tsx.
- The design (colors, type, layout) was rebuilt to match the spirit of the
  original site's content — the exact Framer CSS/markup isn't something
  this can copy, since Framer doesn't expose exportable source.
