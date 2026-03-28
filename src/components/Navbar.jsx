import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HomeIcon, SearchIcon, LibraryIcon, BarChartIcon, UserIcon, BookOpenIcon } from './Icons'

const navItems = [
  { to: '/', end: true, icon: HomeIcon, label: 'Home' },
  { to: '/search', icon: SearchIcon, label: 'Search' },
  { to: '/shelf', icon: LibraryIcon, label: 'Shelf' },
  { to: '/stats', icon: BarChartIcon, label: 'Stats' },
  { to: '/profile', icon: UserIcon, label: 'Profile' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <>
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar-brand">
          <NavLink to="/" aria-label="Bookcase home">
            <BookOpenIcon width={22} height={22} />
            <span>Bookcase</span>
          </NavLink>
        </div>
        <div className="navbar-links-desktop">
          {navItems.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end} aria-label={label}>
              <span className="nav-icon" aria-hidden="true"><Icon /></span>
              <span className="nav-text">{label}</span>
            </NavLink>
          ))}
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
      <div className="mobile-nav" role="navigation" aria-label="Mobile navigation">
        {navItems.map(({ to, end, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={end}>
            <span className="nav-icon" aria-hidden="true"><Icon /></span>
            <span className="nav-text">{label}</span>
          </NavLink>
        ))}
      </div>
    </>
  )
}
