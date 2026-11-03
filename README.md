# Notes App

A simple full-stack notes application with PostgreSQL backend, Node.js/Express API, and React frontend.

## Quick Start (Local Development)

### Prerequisites
- Node.js 24+
- PostgreSQL 16+

### Backend
```bash
cd backend
npm install
cp ../.env.example .env  # Adjust DATABASE_URL if needed
npm run dev              # Runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
# Uses root .env via envDir: '..' in vite.config.js
npm run dev              # Runs on http://localhost:5173
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database user | `notes_user` |
| `POSTGRES_PASSWORD` | Database password | `notes_pass` |
| `POSTGRES_DB` | Database name | `notes_db` |
| `DATABASE_URL` | Backend connection string (local dev) | `postgresql://notes_user:notes_pass@localhost:5432/notes_db` |
| `PORT` | Backend port | `3000` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:5173,http://localhost:4173` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:3000` |

Copy `.env.example` to `.env` from the **notes-app root** to override defaults:
```bash
cp .env.example .env
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/notes` | List all notes |
| POST | `/api/notes` | Create a note (body: `{text}`) |
| DELETE | `/api/notes/:id` | Delete a note |

---

## Project Structure

```
notes-app/
├── .env.example
├── .gitignore
├── README.md
├── backend/
│   ├── package.json
│   └── index.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        └── components/
```
