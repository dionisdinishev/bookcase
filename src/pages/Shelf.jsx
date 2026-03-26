import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserBooks, updateBookStatus, updatePagesRead, updateRating, removeBook } from '../lib/shelf'
import { useToast } from '../components/Toast'
import BookCard from '../components/BookCard'

const STATUS_LABELS = {
  reading: 'Currently Reading',
  want_to_read: 'Want to Read',
  read: 'Read',
}

const STATUS_ORDER = ['reading', 'want_to_read', 'read']

export default function Shelf() {
  const { user } = useAuth()
  const toast = useToast()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getUserBooks(user.id)
      .then(setBooks)
      .catch(() => toast.error('Failed to load books'))
      .finally(() => setLoading(false))
  }, [user.id])

  // Optimistic update helper
  const optimistic = (id, updates, apiCall) => {
    // Apply change immediately
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
    // Then persist
    apiCall().catch(() => {
      toast.error('Failed to save — reverting')
      // Revert on failure
      getUserBooks(user.id).then(setBooks)
    })
  }

  const handleStatusChange = (bookId, newStatus) => {
    const book = books.find(b => b.id === bookId)
    const updates = { status: newStatus }
    if (newStatus === 'read') {
      updates.pages_read = book?.book?.page_count || book?.pages_read || 0
      updates.finished_at = new Date().toISOString()
    }
    if (newStatus === 'reading' && !book?.started_at) {
      updates.started_at = new Date().toISOString()
    }
    optimistic(bookId, updates, () => updateBookStatus(bookId, newStatus))
    toast.success(`Moved to ${STATUS_LABELS[newStatus]}`)
  }

  // Debounced pages update
  const debounceRef = useRef({})
  const handlePagesUpdate = useCallback((bookId, pages) => {
    const parsed = Math.max(0, parseInt(pages) || 0)
    // Optimistic UI update immediately
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, pages_read: parsed } : b))
    // Debounce the API call
    clearTimeout(debounceRef.current[bookId])
    debounceRef.current[bookId] = setTimeout(() => {
      updatePagesRead(bookId, parsed).catch(() => toast.error('Failed to update pages'))
    }, 800)
  }, [])

  const handleRating = (bookId, rating) => {
    optimistic(bookId, { rating }, () => updateRating(bookId, rating))
  }

  const handleRemove = async (bookId) => {
    if (!confirm('Remove this book from your shelf?')) return
    setBooks(prev => prev.filter(b => b.id !== bookId))
    try {
      await removeBook(bookId)
      toast.success('Book removed')
    } catch {
      toast.error('Failed to remove — reverting')
      getUserBooks(user.id).then(setBooks)
    }
  }

  if (loading) return <div className="loading">Loading your shelf...</div>

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = books.filter(b => b.status === status)
    return acc
  }, {})

  const filteredStatuses = filter === 'all'
    ? STATUS_ORDER
    : [filter]

  return (
    <div className="shelf-page">
      <div className="shelf-header">
        <h1>My Shelf</h1>
        <span className="book-count">{books.length} books</span>
      </div>

      <div className="shelf-filters">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({books.length})
        </button>
        {STATUS_ORDER.map(status => (
          <button
            key={status}
            className={`tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {STATUS_LABELS[status]} ({grouped[status]?.length || 0})
          </button>
        ))}
      </div>

      {filteredStatuses.map(status => (
        grouped[status]?.length > 0 && (
          <div key={status} className="shelf-section">
            <h2>{STATUS_LABELS[status]}</h2>
            <div className="shelf-books">
              {grouped[status].map(item => {
                const pageCount = item.book?.page_count || 0
                return (
                  <BookCard
                    key={item.id}
                    book={item}
                    actions={
                      <div className="shelf-actions">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="status-select"
                          aria-label="Reading status"
                        >
                          {STATUS_ORDER.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>

                        {item.status === 'reading' && pageCount > 0 && (
                          <div className="progress-input">
                            <label className="sr-only" htmlFor={`pages-${item.id}`}>Pages read</label>
                            <input
                              id={`pages-${item.id}`}
                              type="number"
                              min="0"
                              max={pageCount}
                              step="1"
                              value={item.pages_read || 0}
                              onChange={(e) => handlePagesUpdate(item.id, e.target.value)}
                              className="pages-input"
                            />
                            <span>/ {pageCount} pages</span>
                            <div className="progress-bar" role="progressbar" aria-valuenow={item.pages_read || 0} aria-valuemin="0" aria-valuemax={pageCount}>
                              <div
                                className="progress-fill"
                                style={{ width: `${Math.min(100, ((item.pages_read || 0) / pageCount) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {item.status === 'read' && (
                          <div className="rating-input" role="group" aria-label="Book rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                className={`star ${star <= (item.rating || 0) ? 'filled' : ''}`}
                                onClick={() => handleRating(item.id, star)}
                                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleRemove(item.id)}
                          className="btn-remove"
                          aria-label={`Remove ${item.book?.title || 'book'}`}
                        >
                          Remove
                        </button>
                      </div>
                    }
                  />
                )
              })}
            </div>
          </div>
        )
      ))}

      {books.length === 0 && (
        <div className="empty-shelf">
          <p>Your shelf is empty!</p>
          <Link to="/" className="btn-primary">Search for books</Link>
        </div>
      )}
    </div>
  )
}
