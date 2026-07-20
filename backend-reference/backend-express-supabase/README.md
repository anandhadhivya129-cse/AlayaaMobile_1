# ALAYAA Backend

Express.js backend for the uploaded ALAYAA React + Vite frontend. It integrates with Supabase Auth, Supabase Postgres, Supabase Storage, Google Maps navigation links, role-based dashboards, and Render deployment.

## Frontend Audit

Inspected routes:

- `/` Home page
- `/login` Customer login
- `/broker/login` Broker login and registration
- `/admin/login` Admin login
- `/dashboard` Customer dashboard
- `/admin/dashboard` Admin dashboard

Inspected components:

- `Navbar`: Buy, Rent, New Projects, Commercial, Cities, Services, customer/broker/admin login links, post property CTA
- `HeroSection`: listing type tabs, city/locality/landmark search, property type filter, budget filter, advanced filter hint
- `FeaturedProperties`: filter pills for All, Buy, Rent, New Projects, Villa, Apartment, Commercial
- `PropertyCard`: expects `img`, `title`, `price`, `location`, `beds`, `baths`, `area`, `rating`, `reviews`, `tag`, `verified`
- `PopularCities`: city listing cards
- `CustomerDashboard`: overview, saved properties, activity, profile
- `AdminDashboard`: stats, listing management, user/settings placeholders
- `BrokerLogin`: broker login and registration form with RERA number

The API returns the full backend schema plus frontend-friendly property aliases so the existing property card can consume the data with minimal frontend changes.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create the `property-images` storage bucket if it was not created by SQL.
4. Copy `.env.example` to `.env` and fill Supabase and Google Maps values.
5. Install and run:

```bash
npm install
npm run dev
```

## Render

Use `render.yaml` or create a Render Web Service manually:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check: `/health`

## Important API Groups

- Auth: `/api/auth`
- Properties: `/api/properties`
- Map markers: `/api/properties/map`
- Featured properties: `/api/properties/featured`
- Customer: `/api/users`
- Broker/Admin dashboards: `/api/dashboard`
- Inquiries: `/api/inquiries`
- Visits: `/api/visits`
- Comparison: `/api/compare`
- Locations: `/api/locations/tamil-nadu/cities`

## Storage

Property images are uploaded with multipart form data using the `images` field. Files are stored in Supabase Storage and public URLs are saved in `property_images`.
