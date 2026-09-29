# LittlePings — Deployment Guide
## Cloudflare Pages + Custom Domain

---

## Overview

| Item | Value |
|---|---|
| Hosting | Cloudflare Pages (free tier) |
| CDN | Cloudflare global edge (300+ PoPs) |
| SSL | Automatic — free, auto-renews |
| Deploy trigger | Push to `main` branch |
| Build command | `npm run build` |
| Output directory | `dist` |
| PWA | ✅ Fully supported |

---

## Step 1 — Buy a Domain

Go to **[Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)** and buy your domain (e.g. `littlepings.com`). Cloudflare sells at cost — no markup.

> You can also buy from Namecheap / GoDaddy / Google Domains and point nameservers to Cloudflare afterward.

---

## Step 2 — Create a GitHub Repository

```bash
# Inside the LittlePings project folder
cd /Users/rajesh-2755/LittlePings
git remote add origin https://github.com/YOUR_USERNAME/littlepings.git
git push -u origin main
```

---

## Step 3 — Create a Cloudflare Pages Project

1. Log in → **[dash.cloudflare.com](https://dash.cloudflare.com)**
2. Left sidebar → **Workers & Pages** → **Create** → **Pages**
3. Connect your GitHub account → select the `littlepings` repo
4. Configure build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | `Vite` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node.js version | `20` |

5. Click **Save and Deploy** — first deploy runs immediately

Your site is now live at:
```
https://littlepings.pages.dev
```

---

## Step 4 — Add GitHub Secrets (for CI/CD auto-deploy)

The CI workflow (`.github/workflows/ci.yml`) needs two secrets:

### Get your Cloudflare API Token
1. Cloudflare dashboard → **My Profile** → **API Tokens** → **Create Token**
2. Use template: **"Cloudflare Pages — Edit"**
3. Copy the token

### Get your Account ID
1. Cloudflare dashboard → any domain → right sidebar → **Account ID**

### Add to GitHub
1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add two secrets:

   | Secret name | Value |
   |---|---|
   | `CF_API_TOKEN` | Your Cloudflare API token |
   | `CF_ACCOUNT_ID` | Your Cloudflare Account ID |

From now on, every `git push` to `main`:
- Runs 72 tests ✅
- Runs lint ✅
- Builds production bundle ✅
- Deploys to Cloudflare Pages automatically 🚀

---

## Step 5 — Add Your Custom Domain

1. Cloudflare Pages → your `littlepings` project → **Custom domains** tab
2. Click **Set up a custom domain**
3. Enter `littlepings.com` (and optionally `www.littlepings.com`)
4. Cloudflare automatically:
   - Creates the DNS CNAME records
   - Issues an SSL certificate (within ~60 seconds)
   - Redirects `www` → apex (or vice versa, your choice)

> If your domain is registered elsewhere, point its nameservers to Cloudflare first:
> `kira.ns.cloudflare.com` and `roan.ns.cloudflare.com` (yours will differ — check the dashboard).

---

## Step 6 — Verify Everything

| Check | URL |
|---|---|
| Site loads | `https://littlepings.com` |
| PWA install prompt | Chrome/Edge address bar — look for ⊕ icon |
| SSL padlock | ✅ in browser address bar |
| Service worker | DevTools → Application → Service Workers → `sw.js` active |
| Headers | DevTools → Network → any request → check `X-Frame-Options`, `Cache-Control` |
| Pages deploy log | Cloudflare dashboard → Pages → your project → Deployments |

---

## Deploy Flow (after setup)

```
git add .
git commit -m "your change"
git push origin main
```

GitHub Actions runs → tests → build → deploys to Cloudflare Pages → live in ~45 seconds.

---

## Rollback

```bash
# Roll back to previous git tag
git checkout v1.1.0
git push origin main --force
```

Or in Cloudflare dashboard → Pages → Deployments → pick any previous deploy → **Rollback to this deployment**.

---

## Environment Variables (if needed later)

Set in Cloudflare Pages → **Settings** → **Environment variables**.  
Prefix with `VITE_` to expose to the browser:
```
VITE_APP_VERSION=1.1.0
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| White screen after deploy | Check `dist/_redirects` exists — it handles client-side routing |
| PWA not installing | Ensure `manifest.json` is served with `Content-Type: application/manifest+json` |
| Old content served | Service worker cache — DevTools → Application → Clear storage → Reload |
| CI deploy fails | Check `CF_API_TOKEN` and `CF_ACCOUNT_ID` secrets are set in GitHub |
| `www` not working | Add `www` as a second custom domain in Cloudflare Pages |
