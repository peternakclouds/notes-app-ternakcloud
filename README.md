# Notes App

A simple full-stack notes application with PostgreSQL backend, Node.js/Express API, and React frontend.

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
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

## Docker Compose (Recommended)

### Start all services
```bash
docker compose up -d --build
```

### Verify healthchecks
```bash
docker compose ps
# All services should show "healthy" status
```

### View logs
```bash
docker compose logs -f
```

### Stop and remove
```bash
docker compose down
```

### Stop and remove with volumes (data reset)
```bash
docker compose down -v
```

### Services
| Service   | Port | Description |
|-----------|------|-------------|
| Frontend  | 4173 | Vite preview (production build) |
| Backend   | 3000 | Express API |
| Database  | 5432 | PostgreSQL (internal only) |

---

## Docker Run + Network (Manual)

### Create network
```bash
docker network create notes-network
```

### Start database
```bash
docker run -d \
  --name notes-db \
  --network notes-network \
  -e POSTGRES_USER=notes_user \
  -e POSTGRES_PASSWORD=notes_pass \
  -e POSTGRES_DB=notes_db \
  -v notes-db-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

### Build and start backend
```bash
docker build -t notes-backend:1.0 ./backend
docker run -d \
  --name notes-backend \
  --network notes-network \
  -e PORT=3000 \
  -e POSTGRES_USER=notes_user \
  -e POSTGRES_PASSWORD=notes_pass \
  -e POSTGRES_DB=notes_db \
  -e CORS_ORIGIN=http://localhost:5173,http://localhost:4173 \
  -p 3000:3000 \
  notes-backend:1.0
```

### Build and start frontend
```bash
docker build -t notes-frontend:1.0 --build-arg VITE_API_URL=http://localhost:3000 ./frontend
docker run -d \
  --name notes-frontend \
  --network notes-network \
  -p 4173:4173 \
  notes-frontend:1.0
```

### Cleanup
```bash
docker rm -f notes-frontend notes-backend notes-db
docker network rm notes-network
docker volume rm notes-db-data
```

---

## Volume Persistence Demo

The PostgreSQL data persists in a named volume (`notes-db-data`).

### Test persistence
1. Start the stack:
   ```bash
   docker compose up -d --build
   ```

2. Create a note via the UI (http://localhost:4173) or API:
   ```bash
   curl -X POST http://localhost:3000/api/notes \
     -H "Content-Type: application/json" \
     -d '{"text":"Persisted data"}'
   ```

3. Stop and remove containers (keep volumes):
   ```bash
   docker compose down
   ```

4. Restart:
   ```bash
   docker compose up -d
   ```

5. Verify the note still exists:
   ```bash
   curl http://localhost:3000/api/notes
   ```

### Reset data (remove volume)
```bash
docker compose down -v
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
├── compose.yaml
├── .env.example
├── .gitignore
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        └── components/
```