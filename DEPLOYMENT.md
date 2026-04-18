# 🪔 Crafts Hub — Full Stack Setup & Deployment Guide

## Architecture Overview

```
crafts_hub/
├── src/                   ← React frontend (Vite)
├── backend/               ← Express + MongoDB API
│   ├── server.js
│   ├── models/            ← Mongoose models (User, Product)
│   ├── routes/            ← auth.js, products.js, manufacturers.js
│   ├── middleware/        ← auth.js (JWT), upload.js (Firebase)
│   └── config/            ← db.js (MongoDB), firebase.js
├── vercel.json            ← Routes API + frontend on Vercel
├── package.json           ← Frontend deps
└── .env.example           ← Frontend env template
```

---

## STEP 1 — Set Up MongoDB Atlas

1. Go to https://cloud.mongodb.com → Create free account
2. Create a **Free Cluster** (M0 tier)
3. Under **Database Access** → Add user with username + password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all — needed for Vercel)
5. Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/crafts_hub?retryWrites=true&w=majority
   ```

---

## STEP 2 — Set Up Firebase Storage

1. Go to https://console.firebase.google.com → Create new project
2. Go to **Storage** → Get started → choose region
3. Under **Rules**, change to allow public reads:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```
4. Go to **Project Settings** → **Service Accounts** → **Generate new private key**
5. Download the JSON file — you'll need these fields:
   - `project_id`
   - `client_email`
   - `private_key`
   - Storage bucket = `your-project-id.appspot.com`

---

## STEP 3 — Create GitHub Repository

```bash
# In your terminal, from the project root folder:
git init
git add .
git commit -m "Initial commit: Crafts Hub full stack"

# Create repo on GitHub (go to github.com/new)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/crafts-hub.git
git branch -M main
git push -u origin main
```

---

## STEP 4 — Deploy Backend on Vercel

> The backend and frontend are deployed as **one Vercel project** using `vercel.json`.

1. Go to https://vercel.com → New Project → Import your GitHub repo
2. **Root Directory**: leave as `/` (root)
3. **Framework Preset**: select **Vite** (for the frontend build)
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Under **Environment Variables**, add ALL of these:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | any long random string (e.g. `crafts_hub_super_secret_2026`) |
| `FIREBASE_PROJECT_ID` | from Firebase service account JSON |
| `FIREBASE_CLIENT_EMAIL` | from Firebase service account JSON |
| `FIREBASE_PRIVATE_KEY` | the full private key string (include `\n` as literal) |
| `FIREBASE_STORAGE_BUCKET` | `your-project-id.appspot.com` |
| `CLIENT_URL` | your Vercel frontend URL (e.g. `https://crafts-hub.vercel.app`) |
| `VITE_API_URL` | `/api` (since frontend + backend are on same domain) |

7. Click **Deploy**

> **Important for FIREBASE_PRIVATE_KEY**: In Vercel, paste the key exactly as it appears in the JSON file including the `\n` characters. Do NOT add extra quotes.

---

## STEP 5 — Run Locally (Development)

### Backend:
```bash
cd backend
cp .env.example .env        # Fill in your actual values
npm install
npm run dev                 # Starts on http://localhost:5000
```

### Frontend:
```bash
# In root directory
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # Starts on http://localhost:5173
```

---

## STEP 6 — After Deployment: Update CORS

Once your Vercel URL is known (e.g. `https://crafts-hub-xyz.vercel.app`):
1. Go to Vercel → Project → Settings → Environment Variables
2. Update `CLIENT_URL` to your actual Vercel URL
3. Redeploy (trigger via Vercel dashboard or `git push`)

---

## API Endpoints Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register buyer or manufacturer |
| POST | `/api/auth/login` | None | Login, returns JWT token |
| GET | `/api/auth/me` | Bearer token | Get current user |
| PUT | `/api/auth/profile` | Bearer token | Update profile |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | None | All products (filter: category, search) |
| GET | `/api/products/:id` | None | Single product |
| GET | `/api/products/my/products` | Manufacturer | This manufacturer's products only |
| POST | `/api/products` | Manufacturer | Create product (multipart/form-data) |
| PUT | `/api/products/:id` | Manufacturer (owner) | Update product |
| DELETE | `/api/products/:id` | Manufacturer (owner) | Delete product + Firebase media |

### Manufacturers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/manufacturers` | None | All manufacturers |
| GET | `/api/manufacturers/:id` | None | Manufacturer + their products |

---

## Key Features Built

✅ **Real JWT Authentication** — login/register saves token to localStorage, rehydrates on refresh  
✅ **Role-based access** — Buyer → buyer dashboard, Manufacturer → manufacturer dashboard  
✅ **Isolated manufacturer data** — each manufacturer only sees/edits their OWN products  
✅ **Full CRUD for products** — create, read, update, delete with real MongoDB persistence  
✅ **Firebase media uploads** — photos (up to 5) and videos stored in Firebase Storage  
✅ **Full edit form** — edit all fields: name, price, description, category, add/remove photos, replace video  
✅ **Delete with cleanup** — deleting a product also removes all its Firebase Storage files  
✅ **Search + filter** — search by name/description, filter by category  
✅ **Profile editing** — manufacturer can update group name, location, bio  
✅ **Loading states** — spinners on all async operations  
✅ **Error handling** — inline error banners for auth, form, and API errors  
