# Build and Deploy BudgetBrain Web

Use this guide to build, test, and deploy the BudgetBrain Next.js web application for production.

Like mobile builds, Next.js bakes `NEXT_PUBLIC_*` environment variables into the JavaScript bundle at **build time**. Configure your production API URL before running `npm run build`.

---

## Prerequisites

- **Node.js**: 20+ (Node 22 LTS recommended)
- **Package Manager**: npm 10+
- **API Server**: Reachable BudgetBrain backend API (port 3002 locally, or your deployed HTTPS backend)

From repo root:
```bash
cd web
npm install
```

---

## 1. Configure Production Environment

Create or edit `web/.env.production` (or `web/.env.local` for local production testing):

```bash
# Local API server (web backend runs on port 3002):
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1

# Or deployed production backend:
# NEXT_PUBLIC_API_URL=https://api.budgetbrain.app/api/v1
# Or EC2 reverse-proxied path:
# NEXT_PUBLIC_API_URL=http://<YOUR_EC2_IP>/web/api/v1

# Google OAuth Web Client ID (Google Cloud Console → Credentials → Web application)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com

# Apple Sign-In (Optional)
NEXT_PUBLIC_APPLE_CLIENT_ID=app.budgetbrain.web.service
NEXT_PUBLIC_APPLE_REDIRECT_URI=https://budgetbrain.app/login
```

> [!IMPORTANT]
> Any variable prefixed with `NEXT_PUBLIC_` is embedded directly into the browser bundle. Never put database credentials, JWT secrets, or private API keys in `web/.env*`.

---

## 2. Compile the Production Build

From `web/`:

```bash
npm run build
```

This performs:
1. TypeScript type checking across all routes and components
2. ESLint code validation
3. Next.js static page generation and code splitting
4. Standalone output optimization (configured in `next.config.ts`)

### Bundle Analysis (Optional)
To inspect chunk sizes and identify heavy dependencies:
```bash
npm run analyze
```
This launches interactive visual dependency maps in your browser.

---

## 3. Test the Production Build Locally

### Option A: Standard Next.js Production Server
```bash
npm run start
```
Starts on `http://localhost:3000`. To customize the port:
```bash
npx next start -p 8080
```

### Option B: Test Standalone Bundle (Mimics Docker / EC2)
`next.config.ts` uses `output: 'standalone'`. It creates a self-contained folder at `.next/standalone` with only necessary `node_modules`:

```bash
# 1. Copy public assets and static chunks into the standalone folder
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 2. Run the lightweight standalone Node server
node .next/standalone/server.js
```
The standalone server runs on port 3000 by default. Set `PORT=8080 node .next/standalone/server.js` to change it.

---

## 4. Docker Deployment

Here is the standard multi-stage production Docker build for BudgetBrain Web:

### Build Container Image
```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL="https://api.budgetbrain.app/api/v1" \
  -t budgetbrain-web:latest .
```

### Run Container
```bash
docker run -d \
  -p 3000:3000 \
  --name budgetbrain-web \
  --restart unless-stopped \
  budgetbrain-web:latest
```

---

## 5. Deploy on Linux Server / EC2 (PM2 + Nginx)

### PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Build the project
npm run build

# Start with PM2
pm2 start npm --name "budgetbrain-web" -- start -- -p 3000

# Save PM2 process list for auto-restart on server reboot
pm2 save
pm2 startup
```

### Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name budgetbrain.app www.budgetbrain.app;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

## 6. Vercel Cloud Deployment

1. Install Vercel CLI (or connect GitHub repository in the Vercel Dashboard):
```bash
npm install -g vercel
vercel login
```

2. Link and deploy from `web/`:
```bash
cd web
vercel
```

3. Set Environment Variables in Vercel Project Settings:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_APPLE_CLIENT_ID`

4. Deploy to production:
```bash
vercel --prod
```

---

## 7. Google & Apple Sign-In Setup for Web

### Google Sign-In
1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit your **OAuth 2.0 Client IDs → Web application**.
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local development)
   - `https://budgetbrain.app` (your production domain)
4. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000`
   - `https://budgetbrain.app`
5. Copy the Client ID into `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and rebuild.

### Apple Sign-In
1. Apple Developer Portal → Certificates, Identifiers & Profiles → Services IDs.
2. Select your Service ID (`app.budgetbrain.web.service`).
3. Add your production domain in **Web Authentication Configuration**.
4. Set Return URL to match `NEXT_PUBLIC_APPLE_REDIRECT_URI` (e.g. `https://budgetbrain.app/login`).

---

## Troubleshooting

- **"Network Error / Unable to reach server"**:
  - The API URL baked at build time points to an unreachable host or wrong port (remember web API is on `:3002`, not `:3001` which is mobile).
  - Verify `curl -I $NEXT_PUBLIC_API_URL/health` from the client machine or server.
  - Check CORS headers on the backend — backend must allow your web domain in `CORS_ORIGIN`.

- **Environment variable changes not taking effect**:
  - `NEXT_PUBLIC_*` values are statically inlined during `npm run build`. You **must** re-run `npm run build` after editing `.env.local` or `.env.production`.

- **404 on `_next/static/...` in standalone deployment**:
  - Ensure you copied both `public/` and `.next/static/` into `.next/standalone/` as shown in Step 3B.

- **Google Sign-In Error: `origin_mismatch` / `popup_closed_by_user`**:
  - The current domain in the browser address bar is not listed in Google Cloud Console's "Authorized JavaScript origins".
