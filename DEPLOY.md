# Nest — Deploy Playbook

Production split: **Render** hosts the FastAPI backend (`backend/`), **Vercel** hosts the React frontend (`frontend/`). Free tier both. CORS is configured to bind the two.

Deploy order matters — **backend first**, then frontend (frontend needs the backend URL as a build-time env).

---

## 0. Prereqs

- Repo pushed to `github.com/tylinndd/nest` on `main`
- Groq API key in hand → https://console.groq.com/keys (create one if needed; free tier is plenty)
- Render account → https://dashboard.render.com (GitHub login works)
- Vercel account → https://vercel.com (GitHub login works)

---

## 1. Deploy backend to Render

1. Dashboard → **New +** → **Web Service**
2. Connect GitHub → pick **tylinndd/nest**
3. Settings:
   - **Name:** `nest-backend` (becomes `https://nest-backend.onrender.com`)
   - **Region:** Oregon (US-West) or Ohio (US-East) — pick whatever's closest to judges
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
4. **Environment** → add these variables (click *Add Environment Variable* for each):

   | Key | Value |
   |-----|-------|
   | `GROQ_API_KEY` | *(paste your key — secret)* |
   | `MODEL_NAME` | `llama-3.3-70b-versatile` |
   | `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` |
   | `CHROMA_DIR` | `vectorstore` |
   | `CHROMA_COLLECTION` | `nest_resources` |
   | `RESOURCE_DB_PATH` | `data/georgia_resources.json` |
   | `ENVIRONMENT` | `production` |
   | `CORS_ORIGINS` | `*` *(temporary — will lock to Vercel URL in Step 4)* |

5. Click **Create Web Service**. First build takes **~8–12 minutes** (HuggingFace model + torch + chromadb).
6. When status flips to **Live**, copy the service URL (e.g. `https://nest-backend-xxxx.onrender.com`).

### 1a. Smoke-test backend

```bash
# Replace with your actual Render URL
RENDER=https://nest-backend-xxxx.onrender.com

curl -sf $RENDER/health | jq .
# Expect: { "ok": true, "environment": "production", "model": "llama-3.3-70b-versatile", "groq_api_key_configured": true }

curl -sf -X POST $RENDER/intake \
  -H "Content-Type: application/json" \
  -d '{"user_profile":{"age":18,"county":"Cobb","status":"Aging out at 18","months_in_care":24,"college_intent":"4yr","top_concerns":["housing"],"enrolled_at_ksu":true,"aged_out_at_18":true,"in_foster_care_at_18":true,"documents":{"birth_certificate":false,"ssn_card":true,"state_id":true,"high_school_transcript":true}}}' | jq '.bestfit_url, .days_remaining'
# Expect: "https://www.best-fit.app" and a number
```

If `/health` returns but `/chat` fails → Groq key is wrong or missing. Check env vars, click *Manual Deploy → Clear build cache & deploy* to retry.

---

## 2. Deploy frontend to Vercel

1. Dashboard → **Add New…** → **Project**
2. **Import** `tylinndd/nest`
3. Settings:
   - **Framework Preset:** Vite (auto-detected)
   - **Root Directory:** `frontend` *(click Edit next to it)*
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
   - **Install Command:** `npm install` (default)
4. **Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://nest-backend-xxxx.onrender.com` *(your Render URL from Step 1)* |

5. Click **Deploy**. Build takes **~1–2 minutes**.
6. When live, copy the Vercel URL (e.g. `https://nest-xxxx.vercel.app`).

---

## 3. End-to-end smoke test

1. Open your Vercel URL in an incognito window.
2. Walk through onboarding as Maria (18, Cobb, Aging out, KSU intent, no birth certificate).
3. Land on Home → verify top-3 tasks render.
4. Tap **Ask Navigator** → send "What benefits can I get at 18?" → verify a real answer with source citations appears (not the "Can't reach Navigator" fallback).
5. Tap **Benefits** → scroll to bottom → verify the **BestFit** "More Georgia benefits" card appears.
6. Tap **Emergency** → verify 988, 211 GA, Crisis Text, Wellroot buttons.

If Navigator shows "Can't reach Navigator" → likely CORS. Open browser devtools Network tab, send a chat, inspect the failing request. If it's a CORS error, re-check `CORS_ORIGINS` on Render matches your Vercel URL exactly (scheme + host, no trailing slash).

---

## 4. Lock down CORS (post-smoke-test)

Render dashboard → `nest-backend` → **Environment** → edit `CORS_ORIGINS`:

```
CORS_ORIGINS=https://nest-xxxx.vercel.app
```

*(use your actual Vercel URL — no trailing slash, no wildcard)*

Save → Render auto-redeploys in ~30s. Re-run the Step 3 smoke test to confirm nothing breaks.

For multiple preview URLs (Vercel creates one per PR), you can comma-separate:
```
CORS_ORIGINS=https://nest-xxxx.vercel.app,https://nest-git-main-tylinndd.vercel.app
```

---

## Keeping the backend warm (optional but recommended)

Render free tier **sleeps after 15 min of inactivity**. First wake after sleep takes ~45–60 seconds — bad for a C-Day demo. Two options:

**Option A — External pinger (free, no code):**
1. Go to https://cron-job.org (or https://uptimerobot.com)
2. Create a new cron job / monitor
3. URL: `https://nest-backend-xxxx.onrender.com/health`
4. Interval: every 10 minutes
5. Done — backend stays warm 24/7

**Option B — Upgrade to paid:** $7/month on Render unlocks always-on + persistent disk.

For C-Day: Option A is fine. Set it up the morning of the event so the backend is already warm when judges walk up.

---

## Troubleshooting

**Build fails on Render with `torch` OOM / memory error**
- Instance is running out of memory during `pip install`. Edit build command to:
  `pip install --no-cache-dir -r requirements.txt`
- If still OOM, upgrade to Starter ($7/mo) for the build, downgrade to Free after first deploy succeeds.

**Frontend builds locally but fails on Vercel**
- `npm ci` is stricter than `npm install`. If lockfile is out of sync: locally run `rm package-lock.json && npm install && git commit -am "fix: regenerate lockfile"` and push.

**`/chat` returns 500 on Render**
- Check **Logs** tab on Render. Most likely: `GROQ_API_KEY` missing or invalid. Regenerate at https://console.groq.com/keys and update the env var.

**`/intake` returns 500 on Render**
- Probably ChromaDB couldn't load the committed vectorstore. Check logs for `PersistentClient` or `chromadb` errors. Manual fix: Render shell → `cd /opt/render/project/src/backend && python -m rag.ingest` then redeploy.

**Frontend shows "Can't reach Navigator" on prod**
- Open browser devtools Network tab, click a chat send, inspect the `/chat` request.
- If it's `net::ERR_FAILED` or `CORS error` → `CORS_ORIGINS` on Render doesn't include your Vercel host. Update and resave.
- If it's a 5xx → backend issue, check Render logs.
- If the request never fires → frontend `VITE_API_URL` is wrong or wasn't rebuilt. Vercel → Deployments → latest → **Redeploy**.

---

## Rollback

Vercel keeps every deployment. Bad push? → Deployments tab → find last working one → **...** → **Promote to Production**.

Render keeps deploys too. Similar flow under **Events** → **Rollback to this version**.

---

## Post-deploy checklist (before closing the session)

- [ ] Both URLs bookmarked somewhere Stephen can find at 4:59 PM
- [ ] `CORS_ORIGINS` locked down to Vercel URL only
- [ ] cron-job.org pinger set up on `/health`
- [ ] README.md updated with live URLs (see `Running locally` section)
- [ ] PLAN.md 4.3 (CMT submission) references the live Vercel URL in its notes
