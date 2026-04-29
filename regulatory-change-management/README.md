# Regulatory Change Management Tool

A full-stack internship project for managing regulatory changes with AI-powered descriptions and recommendations.

## Stack
- **Backend**: Java 17 + Spring Boot 3 + PostgreSQL + Redis + Flyway
- **AI Service**: Python Flask + Groq LLM + ChromaDB
- **Frontend**: React 18 + Vite + Axios

## Quick Start

```bash
cp .env.example .env
# Fill in your values in .env
docker compose up --build
```

| Service    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost:3000       |
| Backend    | http://localhost:8080       |
| AI Service | http://localhost:5000       |

## Project Structure

```
regulatory-change-management/
├── backend/          # Spring Boot REST API
├── ai-service/       # Flask AI microservice
├── frontend/         # React + Vite SPA
├── docker-compose.yml
└── .env.example
```

## API Endpoints

| Method | Path                  | Description          |
|--------|-----------------------|----------------------|
| POST   | /api/auth/login       | Authenticate user    |
| GET    | /api/changes          | List all changes     |
| POST   | /api/changes          | Create a change      |
| GET    | /api/changes/{id}     | Get change by ID     |
| PUT    | /api/changes/{id}     | Update a change      |
| DELETE | /api/changes/{id}     | Delete a change      |
| POST   | /api/describe         | AI description       |
| POST   | /api/recommend        | AI recommendations   |

## Frontend (Vite + React)

Run locally:

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000
```

Build for production:

```bash
cd frontend
npm run build
```

Notes:
- The frontend uses `VITE_API_URL` for production API base URL. For local development the Vite dev server proxies `/api` to `http://localhost:8080`.
- Do not commit `.env` with secrets; use `.env.example` as a template.
