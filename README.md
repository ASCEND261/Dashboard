# ASCEND — Authoritative Scoring & Verification Engine

ASCEND is a trusted SaaS platform for recording, verifying, and measuring team achievements throughout the Tech Sprint Journey 2026.

## Architecture
- **Frontend**: Next.js 16 (React 19, TypeScript, Vanilla CSS, Tailwind, Lucide, Framer Motion)
- **Backend**: Rust (Axum 0.7, Tokio, SQLx, Argon2id, JWT)
- **Database**: PostgreSQL with deterministic ledger auditing
- **Ruleset**: TSJ-2026-v1 Authoritative Scoring Rules

## Quick Start Locally

### 1. Backend
```bash
cd backend
cargo run
```
Runs at `http://localhost:8000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:3000`.

## Production Deployment

### Frontend (Vercel)
Deployed on Vercel:
- Set `NEXT_PUBLIC_API_URL` to your production backend API URL.

### Backend (Render / Railway)
- Multi-stage `Dockerfile` provided.
- `render.yaml` provided for 1-click Managed Postgres + Web Service Blueprint.
- `railway.json` provided for Railway.
- Database automatically bootstraps schema and seed data on initial start via embedded `init_db.sql`.
