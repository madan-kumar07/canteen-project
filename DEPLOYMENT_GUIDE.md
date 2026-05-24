# SmartCanteen Deployment Guide

This guide details how to deploy the **SmartCanteen** platform. The codebase is structured into two main components:
- `frontend/` — React SPA built with Vite and Tailwind CSS.
- `backend/` — Flask backend utilizing gevent-websocket (Socket.IO).

---

## 🚀 1. Frontend Deployment (React SPA)

Both **Vercel** and **Netlify** are optimized for hosting Vite-based static sites. We have already configured native Single Page Application (SPA) routing redirection rules for both platforms so that routes like `/cart` or `/profile` resolve cleanly.

### Option A: Vercel Deployment

1. **Sign In**: Go to [vercel.com](https://vercel.com/) and log in using your GitHub account.
2. **Import Repository**: Click **Add New** > **Project** and import your Git repository.
3. **Configure Build Settings**:
   - **Framework Preset**: Select **Vite**.
   - **Root Directory**: Select `frontend` (extremely important!).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables** (Optional - to connect to a hosted backend):
   - Add `VITE_API_URL` with your hosted Flask endpoint: `https://your-backend-server.com/api`
   - Add `VITE_WS_URL` with your hosted WebSocket endpoint: `https://your-backend-server.com`
5. **Deploy**: Click **Deploy**. Vercel will bundle the application and output a live `.vercel.app` URL.

---

### Option B: Netlify Deployment

1. **Sign In**: Go to [netlify.com](https://app.netlify.com/) and log in with GitHub.
2. **Import Repository**: Click **Add new site** > **Import an existing project** and link your Git repository.
3. **Configure Build Settings**:
   - **Base directory**: `frontend` (extremely important!).
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Environment Variables**:
   - Go to **Site settings** > **Environment variables** > **Add a variable**.
   - Add `VITE_API_URL` and `VITE_WS_URL` as needed.
5. **Deploy**: Click **Deploy site**. Netlify will build the code and host it at a live `.netlify.app` URL.

---

## 🖥️ 2. Backend Deployment (Flask & WebSockets)

Since the backend utilizes persistent Socket.IO WebSockets and a JSON database (`db.json`), it requires a dynamic server environment rather than static hosting. Platforms like **Render**, **Railway**, or **Koyeb** are excellent fits.

### Option: Render Deployment (Free Tier)

1. **Sign In**: Log into [render.com](https://render.com/).
2. **Create Web Service**: Click **New +** > **Web Service** and connect your Git repository.
3. **Configure Settings**:
   - **Name**: `smartcanteen-backend`
   - **Runtime**: **Python**
   - **Root Directory**: `backend` (extremely important!).
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 app:app` (This starts the server with gevent WS support).
4. **Deploy**: Click **Create Web Service**. 

*Note: Since free tier web services spin down after 15 minutes of inactivity, the backend might take 30–50 seconds to respond on the very first load. This is normal behavior on free plans.*
