# Deploying Ember & Oak

A restaurant site with live table availability. The booking engine computes slots on
every request, so the server does real work under load.

**Full walkthrough:** see `../DEPLOYING-RENDER-VERCEL.md` in the parent folder — this
file just gives you this project's specific values for that walkthrough.

## The simple alternative

This project can also deploy as **one Render service** (the API serves the built
client, no Vercel needed, no CORS to configure at all):

| Field | Value |
|---|---|
| Build Command | `npm --prefix server install && npm --prefix client install && npm --prefix client run build` |
| Start Command | `npm --prefix server start` |

If you just want it live with the least fuss, do that instead and skip the rest of
this file. What follows is the Render (API) + Vercel (site) split.

## Render — environment variables

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Atlas connection string, database name `ember_and_oak` |
| `JWT_SECRET` | a fresh random string — generate with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_ORIGIN` | your Vercel URL (placeholder until you have it, see the master guide §5) |
| `PORT` | leave unset |

Root Directory on Render: `server`.

## Vercel — environment variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |

Root Directory on Vercel: `client`.

## Running it locally the way production runs it

```
npm --prefix server install && npm --prefix client install && npm --prefix client run build
cd server
# PowerShell:
$env:NODE_ENV="production"; npm start
```

Open **http://localhost:5001** — not the Vite port. If the built site loads there with
the API on the same origin, the host will work too.
