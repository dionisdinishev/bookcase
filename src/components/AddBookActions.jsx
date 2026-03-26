import { useState } from 'react'
import { useToast } from './Toast'

const STATUS_LABELS = {
  want_to_read: 'Want to Read',
  reading: 'Reading',
  read: 'Read',
}

const STATUS_CLASSES = {
  want_to_read: 'want',
  reading: 'reading',
  read: 'read',
}

export default function AddBookActions({ onAdd, onRemove, initialStatus }) {
  const toast = useToast()
  const [status, setStatus] = useState(initialStatus || null)
  const [loading, setLoading] = useState(false)

  const handleAdd = async (newStatus) => {
    setLoading(true)
    try {
      await onAdd(newStatus)
      setStatus(newStatus)
      toast.success(`Added as "${STATUS_LABELS[newStatus]}"`)
    } catch {
      toast.error('Failed to add book')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      if (onRemove) await onRemove()
      setStatus(null)
      toast.success('Removed from shelf')
    } catch {
      toast.error('Failed to remove')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = async (newStatus) => {
    if (newStatus === status) return
    const prev = status
    setStatus(newStatus)
    try {
      await onAdd(newStatus)
      toast.success(`Moved to "${STATUS_LABELS[newStatus]}"`)
    } catch {
      setStatus(prev)
      toast.error('Failed to update')
    }
  }

  if (loading) {
    return <span className="adding-badge">Saving...</span>
  }

  if (status) {
    return (
      <div className="added-actions">
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value)}
          className={`status-badge ${STATUS_CLASSES[status]}`}
          aria-label="Change reading status"
        >
          <option value="want_to_read">Want to Read</option>
          <option value="reading">Reading</option>
          <option value="read">Read</option>
        </select>
        <button onClick={handleRemove} className="btn-undo" aria-label="Remove from shelf">
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="add-buttons">
      <button onClick={() => handleAdd('want_to_read')} className="btn-add want">
        Want to Read
      </button>
      <button onClick={() => handleAdd('reading')} className="btn-add reading">
        Reading
      </button>
      <button onClick={() => handleAdd('read')} className="btn-add read">
        Read
      </button>
    </div>
  )
}
