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

**Trust and verification**
- Two independent checks, each with its own badge: **Verified landlord** (national ID or passport
  plus a selfie) and **Verified property** (land title UPI plus the title, lease, or a notarised
  authorisation letter when managing for the title holder). A listing with both shows as
  **Fully verified**
- Landlords submit documents under **Owner → Verification**; admins decide in
  **Admin → Verification**, where each request arrives with automatic pre-checks (ID and UPI format,
  ID or parcel already used by another account, missing documents, duplicate listing). Approving is
  what grants the badge; rejecting requires a reason the landlord sees
- Moving a verified listing's pin or address removes its badge until it is checked again
- Listing pages spell out which checks passed, carry safety tips, and have **Report this listing**.
  Three different reporters hide a listing automatically until an admin reviews it
- Duplicate-listing detection (same title, or same location/type/size under another account) holds
  a new listing for review instead of publishing it, and flags existing ones in **Admin → All properties**
- Reviews can only be written by someone who rented or completed a viewing through the platform,
  one per person, and nothing is public until a moderator approves it

**The rental journey (Find → Verify → Visit → Apply → Sign → Manage)**
- Filters for verified-only, WASAC water, cash power and internet; saved searches with a "new
  matches" badge; side-by-side comparison of up to three homes
- Listings show an estimated total monthly cost (rent plus water, electricity, internet, umutekano
  and isuku), an optional click-to-play video tour, and either the exact pin or a general area that
  unlocks once a viewing is confirmed
- Viewing requests, online rental applications, and a rental agreement both sides sign by typing
  their name (printable / save as PDF). The tenant's signature marks the listing as rented
- Tenants track everything under **My rentals** and report repairs against an active tenancy;
  landlords get Viewings, Applications, Tenants & contracts and Maintenance pages
- Disputes can be opened from an agreement and are resolved in **Admin → Reports & disputes**
- English, Kinyarwanda and French (the toggle cycles through all three)
- A data-saver mode (on automatically for `Save-Data` / 2G connections) requests smaller photos

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

**Responsive layout**
- Phones get an app-style bottom tab bar (Home, Explore, Map or Messages, Saved, and your account),
  a slim top bar, and a menu sheet with appearance, language and data-saver settings. Dashboards
  get their own tab bar with a "More" tab for the full menu. Tablets and desktops keep the top
  navigation and sidebar
- Dialogs become bottom sheets on phones; tables turn into card grids below 1280px wide
- Browse docks the map beside the results from 1440px wide and uses a list/map toggle below that
  (a floating button on phones); filters open as a sheet with a "Show N homes" button
- Listing pages use a swipeable photo carousel on phones and keep "Schedule a viewing" in a sticky
  bar until the contact card scrolls into view
- Framer Motion animations follow the operating system's reduced-motion setting

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
- A language toggle sits next to the theme toggle and persists too

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

- **Verification documents are not stored or checked against any registry.** Uploads are object
  URLs like listing photos, and the pre-checks validate formats and duplicates only. A real
  deployment needs private file storage and a reviewer process (or an integration) that confirms
  IDs and land titles with the issuing authorities.
- **SMS and push are not sent.** Notifications record which channels they should go to, and only
  the in-app inbox is delivered. There is a web app manifest but no service worker, so no offline
  support or background push yet.
- Signing an agreement records a typed name and timestamp; it is not a certified e-signature.
- Only the most visible public screens are translated. Dashboards are English, and the Kinyarwanda
  and French strings should be reviewed by native speakers before launch.
- Rent collection, receipts and rent reminders are not built (only the existing mobile-money
  deposit prompt exists).

- This is a demo dataset: 25 listings, 10 users, and a handful of records for every other feature.
- Photo uploads use `URL.createObjectURL` — nothing is actually persisted, and object URLs are
  lost on refresh.
- Your logged-in session, saved listings, recently-viewed list, theme choice, and language
  choice persist in `localStorage` (see `src/utils/storage.ts`) so they survive a refresh.
  Everything else — the mock properties/users/enquiries/chat data, and any create/update/delete
  you make against it — lives in an in-memory store per service and resets on reload, since
  there's no real backend yet.
- Not tested against a screen reader; accessibility work covers semantic HTML, keyboard
  navigation, focus-visible rings, aria-labels on icon-only buttons, and modal focus trapping.
