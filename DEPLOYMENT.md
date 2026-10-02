# Deployment

This project is deployed as a Vite frontend on Vercel and a FastAPI API on Render. Use a hosted PostgreSQL database for persistent production data; the local SQLite default is for development only.

## 1. Create the database and API on Render

1. Create a PostgreSQL database in Render and copy its **Internal Database URL**.
2. In Render, create a Blueprint instance from this repository and select `render.yaml` (or create a Python web service with the settings below).
3. Set `DATABASE_URL` to the database's Internal Database URL and `CORS_ORIGINS` temporarily to `http://localhost:5173` if you have not deployed the frontend yet. The blueprint generates `JWT_SECRET` for you.
4. Wait for the API to deploy. Verify `https://<your-api>.onrender.com/health` returns `{"status":"healthy"}`.

The manual web-service settings are:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

Set optional provider secrets such as `GROQ_API_KEY` in the Render environment dashboard. Never commit production secrets to this repository.

## 2. Deploy the frontend on Vercel

1. Import the same repository into Vercel and set **Root Directory** to `frontend`.
2. Use the Vite defaults: build command `npm run build`, output directory `dist`, install command `npm install`.
3. Add the environment variable `VITE_API_URL` with the full API origin, such as `https://<your-api>.onrender.com` (no trailing slash), then deploy.
4. Copy the deployed frontend origin, such as `https://<your-app>.vercel.app`.

`frontend/vercel.json` routes client-side paths back to the React app so refreshing a nested page works.

## 3. Connect the services

Set Render's `CORS_ORIGINS` to the exact Vercel frontend origin, then redeploy the API. For multiple allowed origins, separate them with commas. Redeploy the Vercel frontend if you change `VITE_API_URL`.

The Blueprint uses Render's free web-service plan to avoid enabling charges by default. Free services can sleep, so use an always-on paid plan if scheduled sends need to run reliably. The API creates database tables at startup; run `python seed.py` from the `backend` directory only if you want the demo seed data.