# Haven property rental frontend

This Vite + React frontend adds tenant, landlord, and admin workspaces to the Property Rental Management System. The public property finder remains available at `/Act`.

## Run locally

1. Install Node.js 20 or newer.
2. From this folder, run `npm ci`.
3. Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to your backend URL followed by `/api`. For local Spring Boot, use `http://localhost:8080/api`.
4. Run `npm run dev` and open the local URL printed by Vite.

Authentication requires a reachable backend and MySQL database. Tenant and landlord accounts can register directly; administrator signup requires the backend `ADMIN_SIGNUP_CODE`. Passwords must be at least eight characters.

## What is connected today

- Property discovery, listing creation and edits, and application review use the existing Spring endpoints when available.
- Account registration/sign-in, protected property and application actions, and tenant/landlord messaging use backend APIs. Messages are stored in MySQL; the open Messages page refreshes every five seconds.
- Theme choice, notifications, preview listings, and the expense ledger are still stored in this browser's `localStorage`. Pay rent remains a preview action.
- Backend CORS allows local Vite development and Vercel subdomains. If you deploy elsewhere, update `CorsConfig` to add the exact frontend origin and redeploy the backend.
- Uploaded images are held in browser storage for the preview. The current backend model has no image upload endpoint, so an uploaded data URL is not sent to MySQL.

## Publish to GitHub

Use the frontend folder that contains `package.json`, `src/`, and this README as the frontend project root. If you already have a GitHub repository, put these changed files in its frontend folder and preserve the backend folder and its deployment files.

From the frontend project root:

```powershell
git status
git add .
git commit -m "Upgrade property rental frontend workspaces"
git push origin main
```

If your default branch has another name, replace `main` with that branch. If this extracted frontend folder is not yet connected to your repository, first open the existing repository folder and copy the frontend files there; then use that repository's configured remote. Avoid initializing and pushing a new repository over the backend repository by accident.

## Deploy on Vercel

1. Push the frontend changes to GitHub.
2. In Vercel, import the existing frontend project or open its project settings.
3. Set **Root Directory** to the folder containing this `package.json` (use `./` when this frontend is the repository root, or `frontend` for a monorepo with a `frontend/` directory).
4. Set **Framework Preset** to Vite. Set **Build Command** to `npm run build` and **Output Directory** to `dist` (install command: `npm ci`).
5. Add the environment variable `VITE_API_BASE_URL` with the deployed backend origin plus `/api`, for example `https://your-api.onrender.com/api`. Vite embeds this value into the frontend during the build, so changing it requires a redeploy.
6. Deploy. `vercel.json` rewrites app paths to the SPA entry page so refreshing `/landlord`, `/messages`, or `/Act` loads the app.
7. Add the exact Vercel domain to the backend CORS allowlist, then redeploy the backend and frontend if you changed the API URL.

## Deploy on Render

1. Push the frontend changes to GitHub.
2. In Render, create a **Static Site** from the frontend repository. If it is already configured, open that Static Site and update its branch/root directory as needed.
3. Set **Root Directory** to the folder containing `package.json` (`.` for this project as its own repository; `frontend` in a monorepo).
4. Set **Build Command** to `npm ci && npm run build` and **Publish Directory** to `dist`.
5. Add `VITE_API_BASE_URL` with the deployed backend URL plus `/api` in the Static Site's environment settings. Trigger a new deploy after changing it.
6. `render.yaml` includes the static-site build/publish settings and a rewrite to `index.html` for direct route refreshes. Render may prompt you to create a Blueprint service if you choose to use this file; otherwise the dashboard settings above are equivalent.
7. Add the Render frontend URL to the backend CORS allowlist and redeploy the backend.

If Vercel and Render both build the same code, set the same `VITE_API_BASE_URL` value in each host's project settings. Keep database passwords and other backend secrets in the backend service settings; never put them in `VITE_*` variables because those values are public in the browser bundle.

