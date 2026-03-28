import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-brand">
        <NavLink to="/" aria-label="Bookcase home"><span className="brand-icon" aria-hidden="true">📖</span> Bookcase</NavLink>
      </div>
      <div className="navbar-links" role="navigation" aria-label="Page navigation">
        <NavLink to="/" end aria-label="Search books">
          <span className="nav-icon" aria-hidden="true">🔍</span>
          <span className="nav-text">Search</span>
        </NavLink>
        <NavLink to="/shelf" aria-label="My bookshelf">
          <span className="nav-icon" aria-hidden="true">📚</span>
          <span className="nav-text">Shelf</span>
        </NavLink>
        <NavLink to="/stats" aria-label="Reading statistics">
          <span className="nav-icon" aria-hidden="true">📊</span>
          <span className="nav-text">Stats</span>
        </NavLink>
        <NavLink to="/profile" aria-label="My profile">
          <span className="nav-icon" aria-hidden="true">👤</span>
          <span className="nav-text">Profile</span>
        </NavLink>
      </div>
      <div className="navbar-user">
        <img
          src={user?.user_metadata?.avatar_url}
          alt="User avatar"
          className="navbar-avatar"
        />
        <button onClick={signOut} className="btn-sign-out" aria-label="Sign out">Sign out</button>
      </div>
    </nav>
  )
}
