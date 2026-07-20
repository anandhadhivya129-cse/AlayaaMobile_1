# ALAYAA Mobile (React Native / Expo)

This is the React Native (Expo) conversion of the ALAYAA web app. It talks to the
**same Supabase backend** (auth, `profiles`/`properties`/`favorites`/`enquiries` tables,
and storage buckets) as the web app — no backend changes needed.

## 1. Install dependencies

```bash
npm install
```

## 2. Environment variables

Copy `.env.example` to `.env` and fill in the same Supabase project values your web
app already uses (Project Settings → API in Supabase):

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Expo automatically exposes vars prefixed `EXPO_PUBLIC_` to app code via `process.env`.

## 3. Run

```bash
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS), or press `a` / `i` for an emulator.

## 4. Supabase Auth redirect (important)

The app uses the `alayaa://` URL scheme (see `app.json`) for password-reset and
email-verification deep links instead of a website URL. In your Supabase project,
add these to **Auth → URL Configuration → Redirect URLs**:

```
alayaa://reset-password
alayaa://login
```

## Brand

Colors, footer, and logo are ported 1:1 from the current web app (`src/theme/colors.js`,
`src/components/Footer.js`, `src/components/Logo.js`) — the teal `#0F766E` / `#134E4A`
identity, not the earlier espresso-brown one. The house-icon logo is an inline SVG
(`react-native-svg`, already a dependency), matching the web `<AlayaaLogo />` exactly.
Footer renders at the bottom of the Home and Browse property lists, same content/links
as the web footer.

## What's included

- **Auth**: customer/broker/admin login & register, forgot/reset password, session
  persisted via AsyncStorage (`src/context/AuthContext.js`, `src/services/api.js`
  — a direct port of the web app's `Api.jsx`, same table/column names).
- **Navigation**: a stack (`RootNavigator`) for public/auth screens, with a role-gated
  bottom-tab navigator per role (`CustomerTabs`, `BrokerTabs`, `AdminTabs`), mirroring
  the web app's `<ProtectedRoute allowedRoles>`.
- **Customer**: browse/search, property detail with EMI calculator + enquiry form,
  saved properties, enquiries with broker replies, profile editor with photo upload
  (`expo-image-picker`).
- **Broker**: my listings (with delete), post property (multi-image picker + Supabase
  Storage upload), enquiries with inline reply, profile editor.
- **Admin**: stats overview, user list with role changes, broker approval queue,
  all-properties moderation.

## Known gaps / next steps

These were simplified to keep the first pass scoped — happy to build any of them out:

- The web app's charts (Recharts growth charts on Admin), map/Leaflet location picker,
  compare-properties, recently-viewed, and the multi-step "Post Property" filter UI
  aren't ported yet — `react-native-maps` is included as a dependency for the map piece.
- Filtering on Home/Browse only wires up text search + status; price/bedroom/type
  filters from the web filter bar aren't in the UI yet (the API function supports them).
- No offline caching — every screen fetches from Supabase on mount/focus.
- Deep-linked email verification/reset flows will open the app via `alayaa://`, but
  you'll want to test the exact redirect URLs against your Supabase project settings.
