# PrinelvaBlog

A responsive blog built with React, Vite, Tailwind CSS, Express, MongoDB, JWT, Quill, Cloudinary, and Nodemailer.

## Requirements

- Node.js 20+
- MongoDB local or Atlas
- Cloudinary credentials for remote image, audio, and video uploads
- SMTP credentials for password reset and newsletter email

## Local setup

### API

```powershell
cd server
npm install
Copy-Item .env.example .env
npm run dev
```

Set `NODE_ENV=development`, the local database URI, and a private development JWT secret in `server/.env`. The API listens on port 5000 by default.

### Web client

```powershell
cd client
npm install
npm run dev
```

Open the Vite URL (normally http://localhost:5173). The client defaults to `http://localhost:5000/api`; set `VITE_API_URL` in `client/.env` to override it.

To safely add the featured categories and one published sample post for each without deleting existing categories or overwriting matching posts, run `npm run seed:categories` from `server` after configuring the API environment and creating an administrator account. This also creates the Job category for assigning and browsing Job posts.

## Administrator

For a first local setup, the server can create an administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when those variables are set. Remove the bootstrap variables after account creation. An administrator can create sub-admin accounts from the dashboard; sub-admins can create and manage posts and moderate comments, but cannot manage staff accounts or newsletter settings. Set a temporary password when creating a sub-admin and share it privately; they can change it from their account page.

## Audio and video

Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the API environment before uploading media. Administrators and sub-admins can upload MP4, WebM, MOV, MP3, M4A, AAC, WAV, and OGG media from the post editor. Each file is limited to 100 MB and is stored in Cloudinary; published posts include playback controls and a download link. Cloudinary account limits, bandwidth, storage, and the hosting provider's request-size/time limits still apply. Large uploads use server memory while being transferred, so use a host configured to accept requests up to 100 MB.

## Production deployment checklist

- Use HTTPS for both the public site and API.
- Set `NODE_ENV=production`, either `MONGO_URI` or `MONGO_URL`, `JWT_SECRET`, `CLIENT_URL`, and `API_PUBLIC_URL`. Production startup rejects a missing MongoDB URI or a missing/default/short JWT secret.
- On startup, the API safely inserts any missing standard category records. It does not delete categories, modify existing category details, or create sample posts.
- Generate a unique random JWT secret (at least 32 characters); never reuse a development value.
- Set `CLIENT_URL` to the exact public web origin. Multiple trusted origins can be comma-separated.
- Set `API_PUBLIC_URL` to the public API origin for sitemap and robots output.
- If deployed behind one trusted reverse proxy, set `TRUST_PROXY=1`; configure the correct hop count for other topologies.
- Configure SMTP to enable password-reset messages, newsletter emails, and new-post notifications. New posts are emailed to newsletter subscribers when published, including drafts changed to published. Admins can also email the latest published post once to subscribers who signed up later.
- Configure Cloudinary before enabling image, audio, or video uploads.
- Set `VITE_API_URL` to the public API URL before building the client. If it is unset or points to localhost, production builds use the same-origin `/api` path; configure the web host to proxy `/api` to the backend in that case.
- Set `VITE_SERVICES_URL` and `VITE_MARKETPLACE_URL` to the public destinations for those services. Their navigation links are hidden when unset; local development addresses are not embedded in production builds.
- Set the same Google OAuth Web client ID as `GOOGLE_CLIENT_ID` in the API and `VITE_GOOGLE_CLIENT_ID` in the client build. In Google Cloud Console, create a Web application OAuth client and allow your local development origin and production website origin as JavaScript origins.
- To obtain that ID, create a project in Google Cloud Console, configure the OAuth consent screen/Google Auth Platform, create an OAuth client of type **Web application**, add authorized JavaScript origins (for example `http://localhost:5173` and your deployed site origin), then copy the client ID into both environment files. No Google client secret is used by this ID-token sign-in flow. Rebuild/restart both apps after setting it.
- Route public `/sitemap.xml` and `/robots.txt` requests on the website domain to the API sitemap and robots endpoints, or configure equivalent hosting rewrites.
- Keep `.env` files and production credentials out of source control; `.env` is ignored by Git.
- Review your privacy notice, contact details, newsletter consent/unsubscribe handling, backup/restore process, and monitoring before accepting real users.

The API applies request limits to authentication and public submission endpoints. Its default in-memory rate-limit store is intended for a single API process; use a shared store when scaling to multiple instances.
The React app is a client-rendered SPA; dynamic post metadata may not be visible to social crawlers. Add prerendering or server-side rendering if reliable link previews and search indexing are launch requirements.

## Security checks

Run `npm test` from `server` for the API authentication middleware tests, and run `npm audit` from both `server` and `client` to check installed dependencies. Keep local credentials in untracked `.env` or `.env.*` files; `.env.example` files contain placeholders only. Never commit production credentials or put private credentials in client `VITE_*` variables, because those values are included in the browser build. If a credential is exposed or committed, revoke and rotate it rather than relying on deleting the file or changing ignore rules.

## Features

- Registration, email login, verified Google sign-in for passwordless comments, password reset/change, and role-protected admin pages
- Draft and published posts, categories, tags, search, pagination, related posts, and downloadable audio/video
- Admin-created sub-admin accounts with post and comment moderation permissions
- Rich-text editor with HTML sanitization before display and save
- Comments for signed-in users; browser-local likes and bookmarks for visitors
- Google users can comment without creating a separate password; Google accounts are created on first sign-in. If their email already belongs to an existing account, they must sign in to that account first rather than risk automatic account linking.
- Share sheet, copy link, WhatsApp, and X links
- Newsletter subscriptions and admin mailing tools
- Dark/light theme, reading time, table of contents, and trending posts
- Per-post metadata, sitemap, and robots endpoints
