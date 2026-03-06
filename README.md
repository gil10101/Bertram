# Bertrum

AI-powered email manager with Gmail/Outlook integration. Assists with scheduling meetings, reading and responding to emails, and organizing/prioritizing inbox.

## Stack

| Layer   | Tech        | Host   | Cost        |
|---------|-------------|--------|-------------|
| Backend | FastAPI     | Railway| ~$5/mo      |
| Frontend| Next.js     | Vercel | Free        |
| DB      | Supabase    | —      | Free        |
| Auth    | Clerk       | —      | Free        |
| AI      | Claude API  | —      | ~$20–50/mo  |
| Email   | Gmail API   | —      | Free        |

**Total: ~$25–55/mo**

## Repo structure

- **`backend/`** — FastAPI app (deploy root: Railway)
- **`frontend/`** — Next.js app (deploy root: Vercel)

## Local development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # Fill in Supabase, Clerk, Gmail, Claude keys
uvicorn app.main:app --reload
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # Fill in NEXT_PUBLIC_CLERK_*, NEXT_PUBLIC_API_URL
npm run dev
```

App: http://localhost:3000

## Deployment

- **Railway**: Connect repo, set root directory to `backend`, add env vars from `.env.example`, deploy.
- **Vercel**: Connect repo, set root directory to `frontend`, add env vars, deploy.
