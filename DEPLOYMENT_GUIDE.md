# Crafts Hub — Full Deployment Guide
## Git → GitHub → Vercel (Frontend + Backend)

---

## What Changed From Your Original Project

| Area | Before | After |
|------|--------|-------|
| Image/Video storage | Firebase Storage | Base64 in MongoDB |
| Firebase deps | `firebase-admin`, `multer-storage-firebase`, `uuid` | Removed entirely |
| Image size limit | 100 MB | 5 MB images / 25 MB videos |
| `Product.photos[].url` | External Firebase URL | `dataUri` (base64 string) |
| `Product.photos[].storagePath` | Firebase path | Removed |
| `server.js` body limit | 10 MB | 50 MB (for base64 payloads) |
| Backend deployment | — | Vercel serverless |
| Frontend deployment | — | Vercel static site |

---

## Prerequisites (Install These First)

1. **Node.js 18+** — https://nodejs.org
2. **Git** — https://git-scm.com
3. **Vercel CLI** — `npm install -g vercel`
4. **A GitHub account** — https://github.com
5. **MongoDB Atlas account** — https://cloud.mongodb.com (free M0 tier)

---

## STEP 1 — Set Up MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com and sign in
2. Click **"Build a Database"** → choose **M0 Free**
3. Choose a cloud provider (AWS) and region closest to India (Mumbai)
4. Set a **username** and **password** — save these!
5. Under **"Network Access"** → Add IP Address → click **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - This is required for Vercel serverless (dynamic IPs)
6. Go to **"Database"** → click **"Connect"** → **"Drivers"**
7. Copy the connection string, it looks like:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Add your database name to it:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/crafts_hub?retryWrites=true&w=majority
   ```
   Save this — you'll need it soon.

---

## STEP 2 — Create Two GitHub Repos

You need **two separate repos** — one for the backend, one for the frontend.

### 2a. Create repos on GitHub
1. Go to https://github.com/new
2. Create repo named: **`crafts-hub-backend`** (Private or Public)
3. Go to https://github.com/new again
4. Create repo named: **`crafts-hub-frontend`** (Private or Public)
5. Leave both **empty** (no README, no .gitignore) — we'll push our code

### 2b. Initialize the Backend repo
```bash
# Extract the downloaded zip first, then:
cd crafts_hub_updated/backend

git init
git add .
git commit -m "Initial commit - Crafts Hub backend (base64 storage)"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/crafts-hub-backend.git
git push -u origin main
```

### 2c. Initialize the Frontend repo
```bash
cd crafts_hub_updated   # root of the project (NOT the backend folder)

git init
git add .
git commit -m "Initial commit - Crafts Hub frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/crafts-hub-frontend.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

---

## STEP 3 — Deploy the Backend to Vercel

The backend must be deployed **first** so you get its URL for the frontend.

### 3a. Using Vercel CLI (Recommended)
```bash
cd crafts_hub_updated/backend

vercel login          # opens browser — sign in with GitHub
vercel                # follow the prompts:
                      #   Set up and deploy? → Y
                      #   Which scope? → your account
                      #   Link to existing project? → N
                      #   Project name → crafts-hub-backend
                      #   Directory → ./  (press Enter)
                      #   Override settings? → N
```

After first deploy, set environment variables:
```bash
vercel env add MONGODB_URI
# paste your full Atlas connection string when prompted
# select: Production, Preview, Development → all three

vercel env add JWT_SECRET
# paste a long random string e.g.: mySuperSecretKey_ChangeMeInProd_2024!
# select: Production, Preview, Development → all three

vercel env add CLIENT_URL
# paste: https://crafts-hub-frontend.vercel.app  (we'll create this next)
# select: Production only
```

Then redeploy to apply env vars:
```bash
vercel --prod
```

You'll get a URL like: `https://crafts-hub-backend.vercel.app`
**Save this URL.**

### 3b. Alternative — Vercel Dashboard (No CLI)
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Connect GitHub → select **crafts-hub-backend**
4. Set **Root Directory** to: `./` (it's already the backend folder)
5. Framework Preset: **Other**
6. Click **"Deploy"**
7. After deploy → go to **Settings → Environment Variables** → add:
   - `MONGODB_URI` = your Atlas URI
   - `JWT_SECRET` = any long random string
   - `CLIENT_URL` = https://crafts-hub-frontend.vercel.app
8. Go to **Deployments** → click **"Redeploy"**

---

## STEP 4 — Deploy the Frontend to Vercel

### 4a. Create the `.env.production` file locally
```bash
cd crafts_hub_updated   # root folder

# Create a .env.production file (NOT .env — Vite uses this for builds)
echo "VITE_API_URL=https://crafts-hub-backend.vercel.app/api" > .env.production

# Add it to git and push
git add .env.production
git commit -m "Add production API URL"
git push
```

> **Note:** `.env` files with real values are gitignored. `.env.production`
> is safe here because it only contains the public API URL (no secrets).

### 4b. Deploy via Vercel CLI
```bash
cd crafts_hub_updated   # root folder

vercel login            # if not already logged in
vercel                  # follow prompts:
                        #   Project name → crafts-hub-frontend
                        #   Directory → ./
                        #   Override build settings? → N
vercel --prod
```

### 4c. Alternative — Vercel Dashboard
1. Go to https://vercel.com/new
2. Import **crafts-hub-frontend** repo
3. Framework Preset: **Vite**
4. Root Directory: `./`
5. Add environment variable:
   - `VITE_API_URL` = `https://crafts-hub-backend.vercel.app/api`
6. Click **Deploy**

You'll get: `https://crafts-hub-frontend.vercel.app`

---

## STEP 5 — Fix CORS (Update Backend CLIENT_URL)

Now that you have the real frontend URL, update the backend's `CLIENT_URL`:

```bash
cd crafts_hub_updated/backend

vercel env rm CLIENT_URL production
vercel env add CLIENT_URL
# enter: https://crafts-hub-frontend.vercel.app
# select: Production

vercel --prod   # redeploy backend
```

---

## STEP 6 — Verify Everything Works

Test these URLs in your browser:

```
# Backend health check
https://crafts-hub-backend.vercel.app/api/health
→ Should return: {"status":"ok","timestamp":"..."}

# Frontend
https://crafts-hub-frontend.vercel.app
→ Should show your Crafts Hub homepage
```

Then test the full flow:
1. Register as a Manufacturer
2. Login → go to Manufacturer Dashboard
3. Create a product with an image (under 5 MB)
4. Go to Products page — image should display ✅

---

## Local Development (After Setup)

### Backend
```bash
cd backend
cp .env.example .env
# Fill in your MONGODB_URI and JWT_SECRET in .env

npm install
npm run dev    # runs on http://localhost:5000
```

### Frontend
```bash
cd crafts_hub_updated   # root
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:5000/api

npm install
npm run dev    # runs on http://localhost:5173
```

---

## Future Deployments (After Code Changes)

### Push backend changes:
```bash
cd backend
git add .
git commit -m "your message"
git push     # Vercel auto-deploys on push
```

### Push frontend changes:
```bash
cd crafts_hub_updated
git add .
git commit -m "your message"
git push     # Vercel auto-deploys on push
```

---

## Important Notes & Limits

| Topic | Detail |
|-------|--------|
| MongoDB document size limit | 16 MB per document — keep products to 1-2 photos max |
| Image limit | 5 MB per image (enforced by backend) |
| Video limit | 25 MB per video (enforced by backend) |
| Vercel free tier | 100 GB bandwidth/month, 100 serverless function invocations/day on Hobby |
| MongoDB Atlas M0 | 512 MB storage — enough for ~50-100 products with images |
| Slow first load? | Vercel serverless functions have "cold start" — first request after inactivity takes ~2s |

---

## Troubleshooting

**"CORS error" in browser console**
→ Make sure `CLIENT_URL` in backend env matches your exact frontend URL (no trailing slash)

**"MongoDB connection error" in Vercel logs**
→ Check that your Atlas cluster allows `0.0.0.0/0` in Network Access

**Images not showing**
→ The `dataUri` field must be present. Old products created with Firebase will have `url` instead — they'll show the placeholder emoji. New products will work correctly.

**"Request entity too large"**
→ File exceeds 25 MB. Vercel also has a 4.5 MB request body limit on the Hobby plan for serverless functions. If hitting this, compress images before upload on the frontend.

> ⚠️ **Vercel Hobby Plan Body Size Limit:** Vercel's free serverless functions
> have a **4.5 MB request body limit**. This means your actual working limits
> will be approximately **3 MB per image** and **4 MB per video** in production,
> even though the backend code allows 5/25 MB. To upgrade this limit you need
> the Vercel Pro plan ($20/month). For the free tier, advise users to compress
> images before uploading.
