# NyumbaLink

A multi-role house rental platform for the Kigali market — guests browse and enquire about
listings, owners manage their properties, and admins review owners and moderate listings.

This is a **frontend-only build**. There is no real backend: all data lives in `src/data/` and is
served through `src/services/`, with an artificial 400–700ms delay so loading states are real.
Every service function returns a `Promise`, so swapping in a real API later is a one-file change
per resource — see [Connecting a real backend](#connecting-a-real-backend).

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. No environment variables or API keys are required — the map
tiles come from the free OpenStreetMap tile server and geocoding (used in the owner's "add
property" wizard) comes from the free OpenStreetMap Nominatim API, both keyless.

Other scripts:

```bash
npm run build     # typecheck + production build
npm run preview   # serve the production build locally
npm run lint      # oxlint
```

## Demo credentials

The login page has a **"Demo accounts"** panel — click any of the three to sign in instantly with
that role. Any password is accepted for a known email; there is no real authentication.

| Role  | Email                  |
| ----- | ---------------------- |
| Admin | `admin@nyumbalink.rw`  |
| Owner | `owner@nyumbalink.rw`  |
| Guest | `guest@nyumbalink.rw`  |

## Feature list

**Public / guest**
- Landing page with animated hero, floating search bar, featured listings, popular locations,
  testimonials, animated stats, and an FAQ accordion
- Browse page: filter sidebar + results grid + live map, all in sync, filters reflected in the
  URL query string, removable filter chips, grid/list toggle, pagination
- Listing detail page: image gallery with lightbox, amenity grid, embedded map with nearby
  landmarks, owner contact modal, similar listings, reviews
- Map-first search page: full-screen clustered map with a slide-in card on pin click
- Auth: login (with the demo panel above), registration, forgot password (UI only), and a
  "become an owner" application form
- Static pages: about, contact (with map), terms, 404, 403

**Owner dashboard**
- Overview with stat cards and a views-over-time chart
- Properties list with publish/unpublish, edit, and delete (with confirmation)
- Five-step add/edit property wizard: basics, details, an interactive map to pin the exact
  location (click or drag, with free reverse geocoding), drag-and-drop photo upload with
  reordering and cover selection, and a final review step
- Enquiries inbox with read/unread state
- Profile settings

**Admin dashboard**
- Overview with platform stats, activity feed, and charts (listings per month / per district)
- Manage owners: search, filter, add, edit, suspend/activate, delete
- Owner applications: approve (provisions an owner account) or reject
- All properties: approve, flag, or remove any listing
- Manage guest users
- Settings

Every list has a loading skeleton, an empty state, and an error state with retry. Forms use
`react-hook-form` + `zod`, with inline validation and a disabled/spinner submit state.

**Comfort and polish**
- Signing in survives a page refresh — your session is restored automatically
- Save listings with the heart icon and revisit them from **Saved** in the navbar (works even
  when logged out; stored per-browser)
- A **Recently viewed** row appears on the landing page once you've opened a listing or two
- Owner/admin dashboards have a notification bell (unread enquiries / pending applications)
- Location fields autocomplete against known Kigali neighbourhoods
- A **WhatsApp** quick-contact button sits next to "Contact owner" on every listing, and a
  **Share** button copies the listing link (or opens the native share sheet on mobile)
- Routes scroll to top on navigation, and a "Skip to content" link appears on first Tab press
- Theme always starts in light mode; toggling it manually persists your choice for next time
- A Kinyarwanda / English language toggle sits next to the theme toggle and persists too

## Tech stack

React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Framer Motion, Leaflet /
react-leaflet + leaflet.markercluster (OpenStreetMap tiles, no API key), lucide-react,
react-hook-form + zod, and React Context + `useReducer` for auth/theme/toast state (no Redux).

Dashboard charts are hand-built SVG/CSS components (`src/components/dashboard/LineChart.tsx`,
`BarChart.tsx`) rather than a charting library, since the two chart types the brief calls for
are simple enough not to justify the extra dependency weight for an app targeting mobile data
in Kigali. Route-level code is split with `React.lazy`, so the Leaflet stack only loads on pages
that use a map.

## Project structure

```
src/
  assets/
  components/
    ui/            design-system primitives (Button, Modal, Table, ...)
    layout/        Navbar, Footer, Sidebar, DashboardShell, AuthCard
    listings/      PropertyCard, FilterPanel, PropertyMap, ImageGallery usage, ...
    dashboard/     StatCard usage, charts, wizard steps, admin widgets
    marketing/     landing page sections
  context/         AuthContext, ThemeContext, ToastContext, FavoritesContext
  data/            mock data (properties, users, enquiries, reviews, applications, testimonials)
  services/        Promise-based data access — the seam for a real API
  hooks/           useFilters, useDebounce, useMediaQuery, useToast, useAsync, ...
  pages/           public/ owner/ admin/
  routes/          layouts, ProtectedRoute, route-change page transitions
  utils/           formatting, constants, filtering, id generation
  styles/          Tailwind entry + global CSS
```

## Connecting a real backend

Everything in `src/services/` returns a `Promise` and is the only place that touches data. To
go live:

1. Replace the body of each function in `src/services/*.ts` with a `fetch` call to your API,
   keeping the same function signatures.
2. Delete the in-memory `store` arrays at the top of `propertiesService.ts`, `usersService.ts`,
   etc. — mutations (create/update/remove) should hit the real endpoint instead.
3. `src/data/*.ts` and the artificial delay in `src/services/delay.ts` are no longer needed.

No component or page imports `src/data/` directly, so this is the only layer that changes.

## Known limitations

- This is a demo dataset: 24 listings, 10 users, and a handful of enquiries/reviews/applications.
- Photo uploads use `URL.createObjectURL` — nothing is actually persisted, and object URLs are
  lost on refresh.
- Your logged-in session, saved listings, recently-viewed list, theme choice, and language
  choice persist in `localStorage` (see `src/utils/storage.ts`) so they survive a refresh.
  Everything else — the mock properties/users/enquiries/chat data, and any create/update/delete
  you make against it — lives in an in-memory store per service and resets on reload, since
  there's no real backend yet.
- Not tested against a screen reader; accessibility work covers semantic HTML, keyboard
  navigation, focus-visible rings, aria-labels on icon-only buttons, and modal focus trapping.
