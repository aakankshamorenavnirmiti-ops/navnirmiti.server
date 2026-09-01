# Nav Nirmiti Constructions — Backend API

Express.js + MongoDB REST API for the Nav Nirmiti Constructions web application.

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
cd server
npm install
```

Copy the example config and fill in your values:

```bash
cp config/config.env.example config/config.env
# Edit config/config.env with your local MongoDB URI, JWT secret, email credentials, etc.
```

Start in development mode (with nodemon auto-restart):

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## Render Deployment Guide

This backend is deployed as a **Web Service** on [Render](https://render.com). A `render.yaml` is included in this repo for reference, but the initial setup requires browser steps.

### Step 1 — Connect the Repository

1. Log in to [dashboard.render.com](https://dashboard.render.com)
2. Click **New → Web Service**
3. Connect your GitHub account and select the `navnirmiticonstructions.backend` repository
4. Choose the `main` branch

### Step 2 — Configure the Service

| Setting | Value |
|---|---|
| **Name** | `navnirmiti-backend` |
| **Region** | Any (closest to your users) |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Plan** | Free (or paid for persistent storage) |

### Step 3 — Set Environment Variables

Add these in the **Environment** tab. **Do NOT commit real values to the repo.**

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random secret (min 32 chars) |
| `JWT_EXPIRE` | `30d` |
| `JWT_COOKIE_EXPIRE` | `30` |
| `EMAIL_USER` | `navnirmiti67@gmail.com` |
| `EMAIL_PASS` | Your Gmail App Password |
| `EMAIL_FROM` | `aakankshamore.navnirmiti@gmail.com` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `CONTACT_EMAIL` | `navnirmiti67@gmail.com` |
| `APP_URL` | Your Render frontend Static Site URL (e.g. `https://navnirmiticonstructions-frontend.onrender.com`) |
| `ADDITIONAL_ORIGINS` | *(optional)* comma-separated extra allowed origins |

> `PORT` is set automatically by Render — do not add it manually.

### Step 4 — Deploy

Click **Create Web Service**. Render will install dependencies and start the server. Future pushes to `main` trigger automatic redeploys.

### Step 5 — Note the Backend URL

After deployment succeeds, copy the URL (e.g. `https://navnirmiti-backend.onrender.com`). You'll need to set this as `REACT_APP_API_URL` in the frontend repo's `.env.production`.

---

## ⚠️ Ephemeral File Storage Warning

The `uploads/` directory is written to the **local filesystem** of the Render server process.

**On Render's free tier (and all ephemeral PaaS platforms), this directory is permanently wiped on every:**
- Deployment
- Service restart
- Instance recycle (Render free tier spins down after inactivity)

**Impact**: All uploaded files — project plan PDFs, agreement PDFs, completion images, and certificates — are **permanently lost** after each restart with no warning to users or administrators.

**Recommendation**: Before storing real production files, integrate a cloud object storage service:

| Service | Best for | Notes |
|---|---|---|
| [Cloudinary](https://cloudinary.com) | Images + PDFs | Free tier; built-in transforms |
| [AWS S3](https://aws.amazon.com/s3/) | All file types | Most flexible; requires AWS account |
| [Backblaze B2](https://www.backblaze.com/b2/) | All file types | S3-compatible; lower cost than AWS |

Until cloud storage is integrated, treat `uploads/` as a **temporary cache only** and keep offline copies of all uploaded files.

---

## API Routes Reference

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login (admin, client, student) |
| POST | `/api/auth/register` | Register new user |
| GET/POST | `/api/projects` | Construction projects |
| GET/POST | `/api/blog` | Blog posts |
| GET/POST | `/api/contact` | Contact form submissions |
| GET/POST | `/api/quotes` | Quote requests |
| GET/POST | `/api/careers` | Career listings |
| GET/POST | `/api/training` | Training modules |
| GET/POST | `/api/registrations` | Training registrations |
| GET/POST | `/api/testimonials` | Testimonials |
| GET/POST | `/api/modules` | Course modules |
| GET/POST | `/api/clients` | Client project data |
| GET/POST | `/api/jobs` | Job openings |
| GET/POST | `/api/email-logs` | Email send logs |
| GET | `/api/download/:filename` | Download uploaded file |

---

## Redeployment

Render auto-deploys on every push to `main`. To trigger a manual redeploy, click **Manual Deploy → Deploy latest commit** in the Render dashboard.
