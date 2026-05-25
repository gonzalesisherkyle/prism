# Prism — AI-powered code review

> Code goes in, insights come out.

Prism automatically reviews GitHub pull requests with an LLM, posts actionable inline feedback back to GitHub, and gives teams a clean dashboard for tracking review quality over time.

## What It Does

- Connects securely to GitHub through OAuth and registers repository webhooks.
- Listens for new commits on pull requests and verifies GitHub webhook signatures.
- Parses changed-file patches into reviewable hunks with line-aware context.
- Uses OpenRouter models to generate focused review findings and searchable review embeddings.
- Posts inline PR comments and stores the full review history in MongoDB.
- Visualizes repository reviews, severity, comments, and score trends in a React dashboard.

## How It Works

1. A user signs in with GitHub and registers a repository in Prism.
2. Prism creates a GitHub `pull_request` webhook for that repository.
3. An opened or updated pull request sends a signed payload to the backend.
4. Prism admits at most three reviews per repository per hour, fetches changed files, parses diffs, and asks the review model for actionable findings.
5. Prism embeds the review summary, stores the review, and posts inline comments to the pull request.
6. The dashboard exposes review history and detailed findings to authenticated users.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB with Mongoose |
| Authentication | GitHub OAuth 2.0 and JWT |
| AI | OpenRouter chat completions and embeddings |
| Hosting | AWS Lightsail, PM2, Nginx, Cloudflare Pages |

## Architecture

```text
                  +----------------------+
                  |   GitHub Pull Request |
                  +----------+-----------+
                             |
                 signed pull_request webhook
                             |
                             v
+----------------+   +-------+-----------------------+
| Cloudflare     |   | AWS Lightsail                  |
| Pages          |   | Nginx -> Express API -> PM2   |
| React frontend +-->| OAuth / repos / reviews API   |
+----------------+   +-------+-----------------------+
                             |
                     admission limit + review queue
                             |
              +--------------+---------------+
              |                              |
              v                              v
     +--------+---------+            +-------+--------+
     | OpenRouter       |            | MongoDB        |
     | review + embed   |            | review history |
     +--------+---------+            +----------------+
              |
              v
     GitHub inline review comments
```

## Local Setup

Prerequisites: Node.js 20+, a MongoDB database, a GitHub OAuth App, an OpenRouter API key, and a public tunnel for local GitHub webhooks.

1. Configure the backend:

   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```

   For local development, set `FRONTEND_URL=http://localhost:5173`, `GITHUB_CALLBACK_URL=http://localhost:4000/auth/callback`, and `PUBLIC_API_URL` to the HTTPS URL of the tunnel reaching port `4000`.

2. Configure the frontend in a second terminal:

   ```bash
   cd frontend
   cp .env.example .env
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173`, sign in through GitHub, and register a repository.

The application uses OpenRouter for both review generation and embeddings. It does not require an Anthropic API key.

## Environment Variables

### Backend

| Variable | Purpose | Example |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Express listening port | `3000` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb+srv://.../prism` |
| `FRONTEND_URL` | Exact browser origin allowed by CORS and OAuth redirect target | `https://prism.pages.dev` |
| `PUBLIC_API_URL` | Public backend origin used for GitHub webhook URLs | `https://api.example.com` |
| `GITHUB_CLIENT_ID` | GitHub OAuth application client ID | `Ov23...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth application secret | `secret` |
| `GITHUB_CALLBACK_URL` | GitHub OAuth callback URL | `https://api.example.com/auth/callback` |
| `GITHUB_WEBHOOK_SECRET` | Secret used to validate webhook signatures | `long-random-value` |
| `OPENROUTER_API_KEY` | OpenRouter API credential | `sk-or-v1-...` |
| `JWT_SECRET` | Secret for Prism session tokens | `long-random-value` |

### Frontend

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_URL` | Browser-visible backend API origin, injected during the Vite build | `https://api.example.com` |

Use [backend/.env.production.example](backend/.env.production.example) for the Lightsail production file and [frontend/.env.example](frontend/.env.example) for Cloudflare-compatible frontend configuration. Never commit filled-in secrets.

## Deployment Guide

### Backend: Lightsail, PM2, and Nginx

1. Assign a Lightsail static IP and point an `A` record such as `api.example.com` at it. HTTPS on a domain is strongly preferred over exposing a raw public IP in production.
2. Clone the project on the Ubuntu instance and create the untracked production configuration:

   ```bash
   cp backend/.env.production.example backend/.env.production
   chmod 600 backend/.env.production
   ```

3. Fill in production values. Set `PUBLIC_API_URL=https://api.example.com`, `GITHUB_CALLBACK_URL=https://api.example.com/auth/callback`, and `FRONTEND_URL` to the deployed Cloudflare Pages origin.
4. Install and enable the Nginx virtual host template at [backend/deploy/nginx/prism.conf](backend/deploy/nginx/prism.conf). Replace `api.your-domain.example`; obtain a TLS certificate before enabling the `443` server block.

   ```bash
   sudo cp backend/deploy/nginx/prism.conf /etc/nginx/sites-available/prism
   sudo ln -s /etc/nginx/sites-available/prism /etc/nginx/sites-enabled/prism
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. Deploy the backend through [deploy.sh](deploy.sh). It pulls `main`, installs locked dependencies, builds TypeScript, creates log storage, loads production variables, and starts or reloads the PM2 app described in [ecosystem.config.js](ecosystem.config.js).

   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   pm2 status
   pm2 logs prism-backend
   ```

6. Configure the GitHub OAuth App callback URL as `https://api.example.com/auth/callback`.
7. GitHub webhooks created through the Prism repository registration screen use `PUBLIC_API_URL` automatically. For a manual or previously created hook, set:

   ```text
   Payload URL:  https://api.example.com/webhook/github
   Content type: application/json
   Secret:       the exact GITHUB_WEBHOOK_SECRET value
   Events:       Pull requests
   ```

   A temporary IP-based test URL can be `http://<LIGHTSAIL_STATIC_IP>/webhook/github`, but production webhook delivery should use the HTTPS domain.

### Frontend: Cloudflare Pages

Connect the repository in Cloudflare Pages and use these build settings:

| Setting | Value |
| --- | --- |
| Root directory | `frontend` |
| Build command | `npm run build` (runs TypeScript validation and `vite build`) |
| Output directory | `dist` |

The committed [frontend/wrangler.toml](frontend/wrangler.toml) declares the Pages build output and the public `VITE_API_URL` binding for Wrangler-managed Pages configuration. Replace its API URL placeholder before deployment.

Because Vite substitutes `VITE_API_URL` while building the static bundle, Git-connected Cloudflare Pages builds must also set `VITE_API_URL=https://api.example.com` under **Settings > Environment variables**. The committed [frontend/public/_redirects](frontend/public/_redirects) file sends client-side React Router URLs to `index.html` on direct navigation.

## Screenshots

### Dashboard

`[Screenshot placeholder: repository dashboard and score cards]`

### Review Detail

`[Screenshot placeholder: inline findings and score trend chart]`

### GitHub Pull Request

`[Screenshot placeholder: Prism comments posted on a pull request]`

## Contributing

Contributions are welcome. Create a focused branch, keep TypeScript checks and production builds green in both applications, and open a pull request describing the behavior and verification performed.

## License

Prism is available under the [MIT License](LICENSE).
