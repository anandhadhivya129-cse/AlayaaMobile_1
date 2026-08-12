# Backend reference (unmodified)

These are the two backend implementations from the original ALAYAA repo, copied here
as-is for reference. **The mobile app does not call either of these** — like the web
frontend, it talks directly to Supabase (auth, database, storage) via
`src/services/api.js`. See the top-level README's "What's included" section.

- `server-express-legacy/` — the original lightweight Express server
  (`server/` in the source repo).
- `backend-express-supabase/` — the newer, fuller Express + Supabase backend
  (`backend/backend/` in the source repo), with its own auth, routes, controllers,
  Supabase schema/RLS SQL, and a Postman collection.

Real `.env` secrets were stripped before bundling — use each folder's `.env.example`
as a template if you ever wire the mobile app (or web app) through these instead of
calling Supabase directly.
