import { useState, useEffect } from 'react'

function App() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${API_URL}/api/notes`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setNotes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNoteContent.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newNoteContent.trim() })
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const newNote = await response.json()
      setNotes(prev => [newNote, ...prev])
      setNewNoteContent('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteNote = async (id) => {
    try {
      setError(null)
      const response = await fetch(`${API_URL}/api/notes/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setNotes(prev => prev.filter(note => note.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
        <p>Loading notes...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <h1>Notes</h1>
      </header>

      {error && (
        <div className="error-message">
          Error: {error}
          <button onClick={fetchNotes}>Retry</button>
        </div>
      )}

      <form onSubmit={handleAddNote} className="add-note-form">
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Write a new note..."
          rows={3}
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !newNoteContent.trim()}>
          {submitting ? 'Adding...' : 'Add Note'}
        </button>
      </form>

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="empty-state">No notes yet. Add your first note above!</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-card">
              <p className="note-content">{note.text}</p>
              <button
                className="delete-btn"
                onClick={() => handleDeleteNote(note.id)}
                aria-label="Delete note"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default App