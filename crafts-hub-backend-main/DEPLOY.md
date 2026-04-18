# Crafts Hub — Deployment Guide

## Overview

This project has **two separate Vercel deployments**:
- **Backend** → deployed from the `/backend` folder
- **Frontend** → deployed from the root `/` folder

---

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/crafts-hub.git
git push -u origin main
```

---

## Step 2 — Deploy the Backend on Vercel

1. Go to https://vercel.com → **New Project** → Import your GitHub repo
2. Set **Root Directory** to: `backend`
3. Set **Framework Preset** to: `Other`
4. Leave Build Command and Output Directory **empty**
5. Add these **Environment Variables**:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://deevenaboddeti:crafthub%40123@crafthub.l805vmk.mongodb.net/crafts_hub?retryWrites=true&w=majority&appName=CraftHub` |
| `JWT_SECRET` | `48a2e2074e1920c313fdf65943c6854697a9f2c71b8242c1a1f09ff7bcf84ff4` |
| `CLIENT_URL` | *(leave blank for now — fill in after step 3)* |

6. Click **Deploy**
7. **Copy the URL** you get, e.g. `https://crafts-hub-backend-xyz.vercel.app`

---

## Step 3 — Deploy the Frontend on Vercel

1. Go to https://vercel.com → **New Project** → Import the **same GitHub repo**
2. Set **Root Directory** to: `/` (the root, NOT backend)
3. Set **Framework Preset** to: `Vite`
4. Set **Build Command** to: `npm run build`
5. Set **Output Directory** to: `dist`
6. Add this **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR_BACKEND_URL.vercel.app/api` |

> ⚠️ Replace `YOUR_BACKEND_URL` with the actual URL from Step 2, and add `/api` at the end.
> Example: `https://crafts-hub-backend-xyz.vercel.app/api`

7. Click **Deploy**
8. **Copy the frontend URL**, e.g. `https://crafts-hub-xyz.vercel.app`

---

## Step 4 — Update CORS in the Backend

1. Go back to your **backend Vercel project**
2. Go to **Settings → Environment Variables**
3. Update `CLIENT_URL` to your frontend URL from Step 3:
   ```
   CLIENT_URL = https://crafts-hub-xyz.vercel.app
   ```
4. Click **Save** then go to **Deployments → Redeploy**

---

## Step 5 — Test It

Open your frontend URL and:
- Register as a **Buyer** → should redirect to Buyer Dashboard ✅
- Register as a **Manufacturer** → should redirect to Manufacturer Dashboard ✅
- Login with both roles ✅
- Manufacturer can add/edit/delete products ✅

---

## Troubleshooting

**Login/Register not working?**
- Check that `VITE_API_URL` in your frontend Vercel project ends with `/api`
- Check it points to the backend domain, not the frontend

**CORS error in browser console?**
- Make sure `CLIENT_URL` in the backend matches your frontend URL exactly (no trailing slash)
- Redeploy the backend after updating

**MongoDB connection error?**
- Your MongoDB Atlas cluster must allow connections from all IPs: `0.0.0.0/0`
- Go to Atlas → Network Access → Add IP Address → Allow from Anywhere
