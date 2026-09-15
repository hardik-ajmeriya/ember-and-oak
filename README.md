# Ember & Oak — Wood-Fired Dining

A full-stack MERN site for a thirty-eight cover restaurant: an editorial marketing site, a
seasonal menu driven by the database, and a **reservation engine that models the actual floor plan**
rather than pretending every time slot is free.

> Built as a portfolio piece. The restaurant is fictional; the booking logic is not.

---

## The interesting part: the availability engine

`server/src/services/availability.js` is the heart of this project.

- **Opening hours are data.** `SERVICE_HOURS` describes lunch and dinner windows per weekday, with
  `null` for closed days. The client renders its date picker from the same source, so the room's
  hours can never drift out of sync with what the website advertises.
- **Tables are real records.** A `DiningTable` has seats and a zone. A party of two is only offered
  tables seating 2–5, so a six-top is not burned on a couple while a larger party is turned away.
- **Turn time scales with party size.** Two people hold a table for 90 minutes; eight hold it for
  150. That duration drives the overlap test, so the grid never offers a slot that would force the
  kitchen to rush the table before or after yours.
- **Overlap is computed in memory.** Two queries — tables, and the day's reservations — then a
  half-open interval test (`rStart < end && start < rEnd`). Fast enough to re-run on every keystroke
  of the party-size selector.
- **Slots are re-validated at write time.** The browser's view of a slot may be minutes old, so
  `claimTable()` recomputes availability during the POST. A slot that has gone returns `409` and the
  UI walks the guest back to the time step instead of silently double-booking the room.

---

## What it demonstrates

**Backend**

- Express 4 + Mongoose 8, layered as routes → controllers → services → models
- A domain service with genuine business logic, unit-testable in isolation from Express
- JWT auth *and* an `optionalAuth` middleware, because guests can book without an account
- Zod request validation returning field-level errors the UI maps straight onto inputs
- Helmet, CORS allow-list, gzip, and two separate rate limiters (auth vs. booking)
- Centralised error handling that converts Mongo duplicate-key and cast errors into readable messages

**Frontend**

- React 18 + Vite with route-level code splitting
- A three-step reservation wizard with animated step transitions and full keyboard access
- Tailwind design system: warm charcoal palette, Cormorant Garamond display type, dotted menu leaders
- Framer Motion — parallax hero, masked headline reveals, staggered editorial grids, layout-animated tabs
- `useFetch` with `AbortController` cleanup; cancelled requests never surface as errors
- Full `prefers-reduced-motion` support and visible focus rings throughout

---

## Pages

| Route | What it does |
| --- | --- |
| `/` | Editorial landing page — parallax hero, kitchen principles, live featured dishes, events |
| `/menu` | Full menu grouped by course, filterable by season and dietary requirement |
| `/story` | The room's history, milestones, and the team |
| `/events` | Wine dinners, chef's table and masterclasses with live seat counts |
| `/reserve` | Three-step booking wizard driven by the live availability API |
| `/visit` | Enquiry form, service times pulled from the API, map and travel directions |
| `/login`, `/register` | Split-screen auth |
| `/account` | Protected — upcoming and previous reservations, with cancellation |

---

## Running it locally

**Requirements:** Node 18+ and MongoDB (local `mongod` or a free Atlas cluster).

```bash
npm run install:all

cp server/.env.example server/.env     # set MONGO_URI and JWT_SECRET
cp client/.env.example client/.env     # optional in dev — Vite proxies /api

npm run seed                           # floor plan, menu, events, existing bookings

npm install                            # root: installs concurrently
npm run dev
```

- Client: <http://localhost:5174>
- API: <http://localhost:5001/api/health>

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Guest | `guest@emberandoak.com` | `ember1234` |
| Staff | `staff@emberandoak.com` | `ember1234` |

The seed fills roughly a third of the next ten days with bookings, so the availability grid shows
genuine pressure rather than a wall of free slots.

---

## API reference

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | Liveness probe |
| `POST` | `/api/auth/register` | — | Create an account |
| `POST` | `/api/auth/login` | — | Sign in |
| `GET` | `/api/auth/me` | Bearer | Current user |
| `GET` | `/api/menu` | — | Menu grouped by course; `?season=` and `?dietary=` |
| `GET` | `/api/menu/featured` | — | Four featured dishes |
| `GET` | `/api/events` | — | Upcoming events |
| `GET` | `/api/events/:slug` | — | One event |
| `GET` | `/api/reservations/availability` | — | `?date=YYYY-MM-DD&partySize=n` → annotated slot grid |
| `GET` | `/api/reservations/hours` | — | Opening hours, for the date picker |
| `POST` | `/api/reservations` | optional | Book a table; `409` if the slot has gone |
| `GET` | `/api/reservations/me` | Bearer | Upcoming and previous bookings |
| `PATCH` | `/api/reservations/:id/cancel` | Bearer | Cancel a booking |
| `POST` | `/api/enquiries` | — | Private dining / press / careers enquiry |

---

## Deploying

**API:** root `server`, build `npm install`, start `npm start`. Set `MONGO_URI`, `JWT_SECRET`,
`NODE_ENV=production`, `CLIENT_ORIGIN`.

**Client:** root `client`, build `npm run build`, output `dist`, `VITE_API_URL=https://your-api/api`.
Add an SPA rewrite so deep links resolve.

---

## Notes

Photography is loaded from Unsplash's CDN for demonstration. Replace the URLs in
`server/src/seed.js` and the page files with licensed assets before commercial use.
