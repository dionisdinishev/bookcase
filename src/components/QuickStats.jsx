import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserStats } from '../lib/shelf'

export default function QuickStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getUserStats(user.id)
      .then(setStats)
      .catch(err => console.error('Failed to load stats:', err))
  }, [user.id])

  if (!stats) return (
    <aside className="quick-stats">
      <div className="quick-stats-loading">Loading stats...</div>
    </aside>
  )

  return (
    <aside className="quick-stats">
      <h3 className="quick-stats-title">Your Reading</h3>

      <div className="quick-stat-items">
        <div className="quick-stat-item">
          <span className="quick-stat-number" style={{ color: 'var(--green)' }}>{stats.booksRead}</span>
          <span className="quick-stat-label">Read</span>
        </div>
        <div className="quick-stat-item">
          <span className="quick-stat-number" style={{ color: 'var(--orange)' }}>{stats.booksReading}</span>
          <span className="quick-stat-label">Reading</span>
        </div>
        <div className="quick-stat-item">
          <span className="quick-stat-number" style={{ color: 'var(--blue)' }}>{stats.booksWantToRead}</span>
          <span className="quick-stat-label">Want</span>
        </div>
      </div>

      <div className="quick-stat-row">
        <span className="quick-stat-row-label">Pages read</span>
        <span className="quick-stat-row-value">{stats.totalPagesRead.toLocaleString()}</span>
      </div>

      {stats.avgRating && (
        <div className="quick-stat-row">
          <span className="quick-stat-row-label">Avg rating</span>
          <span className="quick-stat-row-value">{stats.avgRating} ★</span>
        </div>
      )}

      {stats.topAuthors.length > 0 && (
        <div className="quick-stat-section">
          <span className="quick-stat-section-title">Top Author</span>
          <span className="quick-stat-highlight">{stats.topAuthors[0][0]}</span>
          <span className="quick-stat-sub">{stats.topAuthors[0][1]} books</span>
        </div>
      )}

      {stats.topCategories.length > 0 && (
        <div className="quick-stat-section">
          <span className="quick-stat-section-title">Top Genre</span>
          <span className="quick-stat-highlight">{stats.topCategories[0][0]}</span>
          <span className="quick-stat-sub">{stats.topCategories[0][1]} books</span>
        </div>
      )}

      <Link to="/stats" className="quick-stats-link">
        View detailed stats →
      </Link>
    </aside>
  )
}
