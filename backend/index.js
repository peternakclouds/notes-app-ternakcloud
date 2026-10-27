const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Parse CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['*'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Database connection retry logic
async function connectWithRetry(maxRetries = 6, interval = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      console.log('Connected to PostgreSQL database');
      client.release();
      return true;
    } catch (err) {
      console.log(`Database connection attempt ${attempt}/${maxRetries} failed:`, err.message);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${interval / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }
  return false;
}

// Initialize database schema
async function initializeSchema() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  try {
    await pool.query(createTableQuery);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Failed to initialize schema:', err);
    throw err;
  }
}

// GET /api/notes - List all notes, newest first
app.get('/api/notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, text, created_at FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes - Create a new note
app.post('/api/notes', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Note text cannot be blank' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO notes (text) VALUES ($1) RETURNING id, text, created_at',
      [text.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// DELETE /api/notes/:id - Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM notes WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// GET /health - Health check with database connectivity
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  try {
    await pool.end();
    console.log('Database pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start server
async function start() {
  const connected = await connectWithRetry();
  if (!connected) {
    console.error('Failed to connect to database after retries');
    process.exit(1);
  }

  await initializeSchema();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();