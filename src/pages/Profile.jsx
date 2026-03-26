import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserStats } from '../lib/shelf'

export default function Profile() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getUserStats(user.id)
      .then(setStats)
      .catch(err => console.error('Failed to load stats:', err))
  }, [user.id])

  const meta = user?.user_metadata || {}

  return (
    <div className="profile-page">
      <div className="profile-card">
        <img
          src={meta.avatar_url || meta.picture}
          alt={meta.full_name || 'User'}
          className="profile-avatar"
        />
        <h1 className="profile-name">{meta.full_name || meta.name || 'Reader'}</h1>
        <p className="profile-email">{user.email}</p>

        {stats && (
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-number">{stats.booksRead}</span>
              <span className="profile-stat-label">Read</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-number">{stats.booksReading}</span>
              <span className="profile-stat-label">Reading</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-number">{stats.totalPagesRead.toLocaleString()}</span>
              <span className="profile-stat-label">Pages</span>
            </div>
          </div>
        )}

        <div className="profile-details">
          <p className="member-since">
            Member since {new Date(user.created_at).toLocaleDateString('en', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <button onClick={signOut} className="btn-sign-out-large">
          Sign Out
        </button>
      </div>
    </div>
  )
}
