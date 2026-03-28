import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserStats } from '../lib/shelf'

export default function Stats() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserStats(user.id)
      .then(setStats)
      .catch(err => console.error('Failed to load stats:', err))
      .finally(() => setLoading(false))
  }, [user.id])

  if (loading) return <div className="loading">Loading stats...</div>
  if (!stats) return <div className="error">Failed to load stats</div>

  const monthlyEntries = Object.entries(stats.monthlyReads)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)

  const maxMonthly = Math.max(...monthlyEntries.map(([, v]) => v), 1)

  // Reading progress ring
  const total = stats.totalBooks || 1
  const readPct = Math.round((stats.booksRead / total) * 100)
  const readingPct = Math.round((stats.booksReading / total) * 100)
  const wantPct = Math.round((stats.booksWantToRead / total) * 100)

  return (
    <div className="stats-page">
      <h1>Reading Stats</h1>

      {/* Overview cards */}
      <div className="stats-overview">
        <div className="stats-ring-card">
          <div className="ring-chart">
            <svg viewBox="0 0 120 120" className="ring-svg">
              <circle cx="60" cy="60" r="50" className="ring-bg" />
              <circle
                cx="60" cy="60" r="50"
                className="ring-fill ring-read"
                strokeDasharray={`${readPct * 3.14} ${314 - readPct * 3.14}`}
                strokeDashoffset="0"
              />
              <circle
                cx="60" cy="60" r="50"
                className="ring-fill ring-reading"
                strokeDasharray={`${readingPct * 3.14} ${314 - readingPct * 3.14}`}
                strokeDashoffset={`${-readPct * 3.14}`}
              />
              <circle
                cx="60" cy="60" r="50"
                className="ring-fill ring-want"
                strokeDasharray={`${wantPct * 3.14} ${314 - wantPct * 3.14}`}
                strokeDashoffset={`${-(readPct + readingPct) * 3.14}`}
              />
            </svg>
            <div className="ring-center">
              <span className="ring-number">{stats.totalBooks}</span>
              <span className="ring-label">books</span>
            </div>
          </div>
          <div className="ring-legend">
            <span className="legend-item"><span className="legend-dot read" /> {stats.booksRead} Read</span>
            <span className="legend-item"><span className="legend-dot reading" /> {stats.booksReading} Reading</span>
            <span className="legend-item"><span className="legend-dot want" /> {stats.booksWantToRead} Want to Read</span>
          </div>
        </div>

        <div className="stats-numbers">
          <div className="stat-card highlight">
            <span className="stat-number">{stats.totalPagesRead.toLocaleString()}</span>
            <span className="stat-label">Pages Read</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.avgPagesPerBook}</span>
            <span className="stat-label">Avg Pages / Book</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.avgRating ? `${stats.avgRating} ★` : '—'}</span>
            <span className="stat-label">Avg Rating</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.booksRead}</span>
            <span className="stat-label">Books Finished</span>
          </div>
        </div>
      </div>

      {/* Monthly chart */}
      {monthlyEntries.length > 0 && (
        <div className="stats-section">
          <h2>Monthly Reading</h2>
          <div className="chart-bar">
            {monthlyEntries.map(([month, count]) => (
              <div key={month} className="bar-item">
                <div className="bar-fill-wrapper">
                  <div
                    className="bar-fill"
                    style={{ height: `${(count / maxMonthly) * 100}%` }}
                  >
                    <span className="bar-value">{count}</span>
                  </div>
                </div>
                <span className="bar-label">
                  {new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top authors & genres side by side */}
      <div className="stats-two-col">
        {stats.topAuthors.length > 0 && (
          <div className="stats-section">
            <h2>Top Authors</h2>
            <div className="top-list">
              {stats.topAuthors.map(([author, count], i) => (
                <div key={author} className="list-row">
                  <span className="list-rank">#{i + 1}</span>
                  <span className="list-name">{author}</span>
                  <div className="list-bar-wrapper">
                    <div
                      className="list-bar author"
                      style={{ width: `${(count / stats.topAuthors[0][1]) * 100}%` }}
                    />
                  </div>
                  <span className="list-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.topCategories.length > 0 && (
          <div className="stats-section">
            <h2>Top Genres</h2>
            <div className="top-list">
              {stats.topCategories.map(([category, count], i) => (
                <div key={category} className="list-row">
                  <span className="list-rank">#{i + 1}</span>
                  <span className="list-name">{category}</span>
                  <div className="list-bar-wrapper">
                    <div
                      className="list-bar genre"
                      style={{ width: `${(count / stats.topCategories[0][1]) * 100}%` }}
                    />
                  </div>
                  <span className="list-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {stats.totalBooks === 0 && (
        <div className="empty-stats">
          <p>No books yet! Start by adding some books to your shelf.</p>
        </div>
      )}
    </div>
  )
}
