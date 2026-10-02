<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,50:1E3A8A,100:2563EB&height=220&section=header&text=Janova&fontSize=58&fontColor=FFFFFF&animation=fadeIn&fontAlignY=38" alt="Janova">
</p>

<p align="center">
  <strong>AI-powered multilingual communication for smarter audience engagement</strong>
</p>

<p align="center">
  Janova helps organizations create, personalize, translate, review, schedule, and manage public-awareness campaigns across diverse audiences and communication channels.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-UI-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/SQLAlchemy-ORM-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy">
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/Groq-AI-F55036?style=for-the-badge" alt="Groq">
  <img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT">
</p>

---

## Overview

**Janova** is a full-stack AI-powered mass communication and public awareness platform designed for organizations that need to communicate important information to large and linguistically diverse audiences.

The platform combines **audience management, campaign planning, AI-generated content, multilingual translation, personalization, sentiment analysis, compliance validation, scheduling, and multi-channel communication** into a unified system.

It is designed for use cases such as public awareness campaigns, educational announcements, emergency communication, organizational announcements, and large-scale outreach.

---

## Key Features

### Audience Management

* Centralized recipient and audience database
* Audience profiles containing:

  * Name
  * Email
  * Phone
  * Language
  * State
  * City
  * Occupation
  * Organization
  * Engagement score
* Audience search and filtering
* Dynamic audience segmentation
* Filtering by language, state, city, occupation, organization, and engagement score
* Audience segment preview before campaign deployment

### Campaign Management

* Create and manage communication campaigns
* Campaign categories:

  * Awareness
  * Emergency
  * Education
  * Announcement
* Draft and scheduled campaign workflows
* Campaign scheduling
* Recipient and audience selection
* Saved audience segment rules
* Campaign content management
* Reusable communication templates

### AI-Powered Content Generation

Janova uses an LLM-powered content layer to assist communication teams in creating campaign content.

Supported capabilities include:

* AI campaign content generation
* Brief-to-message generation
* Tone-aware content generation
* Content improvement
* Personalized communication generation

Supported tones include:

* Informative
* Friendly
* Formal
* Urgent

A deterministic fallback mechanism keeps the application demonstrable when an external AI provider is unavailable.

### Multilingual Communication

Janova enables organizations to communicate with audiences in multiple Indian languages.

Supported languages include:

* Hindi
* Telugu
* Tamil
* Kannada
* Malayalam
* Marathi
* Gujarati
* Bengali
* Punjabi
* Odia
* Additional Indic languages supported through the platform's language mapping

The translation layer adapts campaign content for linguistically diverse audiences while maintaining the intended communication context and tone.

### AI Personalization

Messages can be personalized according to recipient and audience information such as:

* Language
* Location
* Occupation
* Organization
* Engagement history

This allows the same campaign to be adapted for different audience segments instead of relying on a single generic message.

### Sentiment & Tone Analysis

The AI layer evaluates campaign communication and provides:

* Sentiment score
* Sentiment label
* Suggested communication tone
* Improved wording recommendations

### AI Content Review & Compliance

Janova provides an automated content-review layer before campaign distribution.

The review process includes:

* Compliance validation
* Readability analysis
* Blocked-term detection
* Sentiment analysis
* Tone recommendations
* Improved wording suggestions

A server-side compliance gate prevents content that fails validation from proceeding to distribution until it has been corrected.

### Campaign Scheduling

Campaigns can be scheduled for future delivery using:

* Saved audience segments
* Selected recipients
* Configured communication channels
* Approved campaign content
* Scheduled execution time

### Multi-Channel Distribution

Janova provides distribution adapters for:

* Email / SMTP
* SMS through Twilio
* WhatsApp Cloud API
* Push notifications through OneSignal

The distribution layer separates communication channels from campaign and AI logic, making the platform modular and extensible.

### Analytics & Feedback

The platform provides analytics capabilities for monitoring campaign engagement and communication feedback.

This enables organizations to evaluate campaign performance and understand audience interaction.

---

## System Architecture

```text
                         ┌─────────────────────────┐
                         │        JANOVA UI        │
                         │ React + Vite + Tailwind │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       FastAPI API       │
                         │ Authentication & RBAC   │
                         └────────────┬────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
      ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
      │   Audience    │       │   Campaigns   │       │  Templates    │
      │  Management   │       │  Management   │       │   Library     │
      └───────┬───────┘       └───────┬───────┘       └───────────────┘
              │                       │
              └───────────────┬───────┘
                              ▼
                    ┌─────────────────────┐
                    │     AI Service      │
                    │                     │
                    │ Content Generation  │
                    │ Translation         │
                    │ Personalization     │
                    │ Sentiment Analysis  │
                    │ Content Review      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Compliance & Review │
                    │       Gateway       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Campaign Scheduler  │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
      ┌────────┐          ┌────────┐          ┌──────────┐
      │ Email  │          │  SMS   │          │ WhatsApp │
      │ SMTP   │          │ Twilio │          │   API    │
      └────────┘          └────────┘          └──────────┘
                               │
                               ▼
                         ┌────────────┐
                         │ OneSignal  │
                         │   Push     │
                         └────────────┘
```

---

## Technology Stack

### Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Recharts-Analytics-FF6384?style=for-the-badge" alt="Recharts">
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios">
</p>

* React
* Vite
* Tailwind CSS
* Recharts
* Axios

### Backend

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy">
  <img src="https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge" alt="Pydantic">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
</p>

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* SQLite
* JWT Authentication

### AI & Communication

<p align="center">
  <img src="https://img.shields.io/badge/Groq-F55036?style=for-the-badge" alt="Groq">
  <img src="https://img.shields.io/badge/SMTP-Email-4A90E2?style=for-the-badge" alt="SMTP">
  <img src="https://img.shields.io/badge/Twilio-SMS-F22F46?style=for-the-badge&logo=twilio&logoColor=white" alt="Twilio">
  <img src="https://img.shields.io/badge/WhatsApp-Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp">
  <img src="https://img.shields.io/badge/OneSignal-Push-E54B4D?style=for-the-badge" alt="OneSignal">
</p>

* Groq OpenAI-compatible Chat Completions API
* LLM-based content generation
* Multilingual translation
* AI personalization
* Sentiment analysis
* Automated content review
* Deterministic AI fallback
* SMTP
* Twilio
* WhatsApp Cloud API
* OneSignal

---

## Authentication & Authorization

Janova implements JWT-based authentication with role-based access control.

### Supported Roles

| Role                    | Responsibility                             |
| ----------------------- | ------------------------------------------ |
| **Admin**               | Platform and user management               |
| **Campaign Manager**    | Campaign planning and management           |
| **Communications Team** | Content review and communication workflows |

---

## Core Modules

```text
Janova
│
├── Authentication & Authorization
│
├── Audience Management
│   ├── Recipient Database
│   ├── Search & Filtering
│   └── Audience Segmentation
│
├── Campaign Management
│   ├── Campaign Creation
│   ├── Campaign Scheduling
│   ├── Recipient Selection
│   └── Campaign Publishing
│
├── Content Management
│   ├── Templates
│   └── Content Library
│
├── AI Communication Engine
│   ├── Content Generation
│   ├── Translation
│   ├── Personalization
│   ├── Sentiment Analysis
│   └── Content Review
│
├── Compliance Layer
│   ├── Readability
│   ├── Blocked Terms
│   └── Compliance Gate
│
├── Campaign Scheduler
│
├── Distribution Engine
│   ├── Email
│   ├── SMS
│   ├── WhatsApp
│   └── Push Notifications
│
└── Analytics & Feedback
```

---

## AI Communication Pipeline

```text
Campaign Brief
      │
      ▼
AI Content Generation
      │
      ▼
Tone & Readability Analysis
      │
      ▼
Sentiment Analysis
      │
      ▼
Compliance & Quality Review
      │
      ▼
Content Improvement
      │
      ▼
Multilingual Translation
      │
      ▼
Recipient Personalization
      │
      ▼
Audience & Channel Selection
      │
      ▼
Campaign Scheduling
      │
      ▼
Multi-Channel Distribution
      │
      ▼
Analytics & Feedback
```

---

## API Architecture

### Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Audience Management

```text
POST /recipients
GET  /recipients
GET  /recipients/search
GET  /recipients/segments/options
POST /recipients/segments/preview
```

### Campaign Management

```text
POST   /campaigns
GET    /campaigns
GET    /campaigns/{campaign_id}
PUT    /campaigns/{campaign_id}
POST   /campaigns/{campaign_id}/publish
DELETE /campaigns/{campaign_id}
```

### Template Management

```text
GET    /templates/
POST   /templates/
GET    /templates/{template_id}
PUT    /templates/{template_id}
DELETE /templates/{template_id}
```

### AI Services

```text
POST /ai/generate-content
POST /ai/translate
POST /ai/personalize
POST /ai/sentiment
POST /ai/review
GET  /ai/content/{campaign_id}
```

---

## Project Structure

```text
Janova/
│
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
│   │   │
│   │   ├── services/
│   │   │   ├── distribution/
│   │   │   └── scheduler/
│   │   │
│   │   ├── ai_service.py
│   │   ├── auth.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   │
│   ├── seed.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   └── SUBMISSION_GUIDE.md
│
└── presentations/
    └── FINAL_PRESENTATION.md
```

---

## Key Design Highlights

* **AI-assisted communication** for faster content creation
* **Multilingual outreach** for linguistically diverse audiences
* **Audience segmentation** for targeted communication
* **Recipient-level personalization** for relevant messaging
* **Server-side compliance gate** before distribution
* **Modular distribution adapters** for multiple communication channels
* **Automated campaign scheduling**
* **JWT authentication and role-based authorization**
* **Deterministic fallback AI layer** for reliable demonstrations
* **Analytics-ready architecture** for measuring campaign engagement

---

## Use Cases

Janova can support communication workflows for:

* Government departments
* Educational institutions
* NGOs
* Public-awareness initiatives
* Emergency communication teams
* Healthcare awareness organizations
* Large enterprises
* Community organizations
* Public-service campaigns

---

## Future Enhancements

* PostgreSQL-based production database
* Distributed background job processing
* Advanced campaign analytics
* Provider delivery webhooks
* Real-time campaign monitoring
* Rate limiting and advanced security controls
* Advanced audience recommendation
* AI-driven campaign optimization
* Expanded Indic language support
* Enterprise-grade secret management
* Scalable cloud deployment

---

<p align="center">
  <strong>Janova</strong>
  <br>
  <i>Multilingual AI-powered communication for connected communities.</i>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2563EB,50:1E3A8A,100:0F172A&height=120&section=footer" alt="Janova footer">
</p>
