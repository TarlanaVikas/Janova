# Janova — Multilingual Mass Communication & Public Awareness Platform

A full-stack AI-powered platform for organizations to plan campaigns, manage audiences, generate and review communication content, translate it into Indian languages, personalize messages, schedule campaigns, and prepare communications for multi-channel distribution.

## Submission materials

- [Submission guide](docs/SUBMISSION_GUIDE.md): architecture, workflow, API overview, setup, demo checklist, verification status, and known limitations.
- [Final presentation](presentations/FINAL_PRESENTATION.md): slide-ready project presentation source.

The platform is a development/demo implementation. Review the verification status and limitations in the submission guide before describing provider-backed delivery, security testing, or scale testing as completed.

## Week 1–4 implementation status

### Weeks 1–2 — Audience Management & Campaign Planning
- JWT authentication and role-based access control for `admin`, `campaign_manager`, and `comms_team`.
- Recipient/audience database with name, email, phone, language, state, city, occupation, organization, and engagement score.
- Audience search and filtering.
- Audience segmentation by:
  - language
  - state
  - city
  - occupation
  - organization
  - minimum/maximum engagement score
- Segment preview endpoint and campaign UI.
- Campaign types: awareness, emergency, education, announcement.
- Draft and scheduled campaign workflows.
- Date/time campaign scheduling.
- Reusable communication templates/content library with create, read, update, and delete support.
- Campaign recipient selection and saved segment rules.

### Weeks 3–4 — AI Content Generation & Multilingual Communication
- LLM-assisted campaign content generation.
- Tone-aware generation: informative, friendly, formal, and urgent.
- Translation into major Indian languages and additional Indic languages supported by the language map.
- Recipient-specific AI personalization using language, location, occupation, organization, and engagement history.
- AI sentiment analysis with score, label, suggested tone, and improved wording.
- AI content quality/compliance review.
- Readability checks and blocked-term validation.
- Pre-deployment compliance gate: content that fails review cannot be distributed until corrected.
- FastAPI endpoints for generation, translation, personalization, sentiment, review, and campaign content retrieval.
- Scheduled campaigns execute automatically through the background scheduler.
- Deterministic AI fallback keeps the application demo-able without an AI key.

## Stack

- Backend: FastAPI, SQLAlchemy, SQLite, JWT, Pydantic
- AI: Groq OpenAI-compatible Chat Completions API with deterministic fallback
- Frontend: React, Vite, Tailwind CSS, Recharts
- Scheduling: FastAPI startup scheduler
- Distribution adapters: Email/SMTP, Twilio SMS, WhatsApp Cloud API, OneSignal Push

## Project structure

```text
AI-Multilingual-Communication-System-main/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth_router.py
│   │   │   ├── audience_router.py
│   │   │   ├── campaigns.py
│   │   │   ├── ai_router.py
│   │   │   ├── distribution_router.py
│   │   │   ├── analytics_router.py
│   │   │   └── template_router.py
│   │   ├── services/
│   │   │   ├── distribution/
│   │   │   └── scheduler/
│   │   ├── ai_service.py
│   │   ├── auth.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   ├── seed.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    ├── package.json
    └── vite.config.js
```

## Requirements

Install:
- Python 3.10 or newer
- Node.js 18 or newer
- npm

No external database is required for local development. SQLite is created automatically.

## 1. Backend setup — Windows

Open PowerShell or Command Prompt:

```bat
cd AI-Multilingual-Communication-System-mainackend
python -m venv venv
venv\Scriptsctivate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Create the environment file:

```bat
copy .env.example .env
```

For demo mode, you can leave `GROQ_API_KEY` empty.

For real LLM generation/translation/sentiment, edit `.env`:

```env
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=replace_with_a_long_random_secret
```

Start the API:

```bat
uvicorn app.main:app --reload --port 8000
```

Backend:
- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

## 2. Seed demo data

In another terminal:

```bat
cd AI-Multilingual-Communication-System-mainackend
venv\Scriptsctivate
python seed.py
```

If you want a completely fresh demo database, delete `backend/mcapp.db` first and run `seed.py` again.

Demo accounts are defined by the seed script. Use the credentials printed/documented by the current `seed.py`.

## 3. Frontend setup

Open another terminal:

```bat
cd AI-Multilingual-Communication-System-mainrontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend Axios client targets the FastAPI backend on port 8000.

## 4. Recommended Week 1–4 demo flow

1. Register/login.
2. Open **Audience** and review the recipient database.
3. Use language, state, city, occupation, and organization filters.
4. Open **Campaigns → New Campaign**.
5. Select campaign type and enter the campaign brief.
6. Create an audience segment and click **Preview Audience**.
7. Optionally select individual recipients as an additional audience restriction.
8. Save the campaign.
9. Generate AI content from the campaign brief.
10. Run the AI content review and inspect:
   - compliance
   - readability
   - sentiment
   - suggested tone
   - improved wording
11. Translate the approved content into Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi, Odia, or other supported languages.
12. Personalize the message for recipients.
13. Schedule the campaign or send it manually.
14. Use Analytics/Feedback to inspect engagement and sentiment.

## Important environment variables

### AI
```env
GROQ_API_KEY=
```

### Authentication
```env
JWT_SECRET=change-this-in-production
```

### Database
SQLite is the default:

```env
DATABASE_URL=sqlite:///./mcapp.db
```

### Optional real distribution providers

The application contains adapters for Email/SMTP, Twilio SMS, WhatsApp Cloud API, and OneSignal Push. These providers require their own credentials. You do not need them to demonstrate Weeks 1–4 AI, audience, campaign, segmentation, template, and review functionality.

## Core Week 3–4 API endpoints

```text
POST /ai/generate-content
POST /ai/translate
POST /ai/personalize
POST /ai/sentiment
POST /ai/review
GET  /ai/content/{campaign_id}
```

## Core Week 1–2 API endpoints

```text
POST /auth/register
POST /auth/login
GET  /auth/me

POST /recipients
GET  /recipients
GET  /recipients/search
GET  /recipients/segments/options
POST /recipients/segments/preview

POST /campaigns
GET  /campaigns
GET  /campaigns/{campaign_id}
PUT  /campaigns/{campaign_id}
POST /campaigns/{campaign_id}/publish
DELETE /campaigns/{campaign_id}

GET    /templates/
POST   /templates/
GET    /templates/{template_id}
PUT    /templates/{template_id}
DELETE /templates/{template_id}
```

## Notes

- The AI layer uses a real LLM when `GROQ_API_KEY` is configured.
- Without a key, generation, translation, personalization, and sentiment use deterministic fallback logic so the project remains runnable for presentations.
- The compliance gate is enforced server-side immediately before distribution.
- Scheduled campaigns use the saved segment, selected recipients, saved channels, and approved campaign content.
- For production deployment, use PostgreSQL, a persistent job queue, provider webhooks, rate limiting, secret management, and stricter account provisioning.
