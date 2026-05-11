import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../App.css'

const AppShell = ({ children }) => {
  const { user, roles, logout } = useAuth()

  const isAdmin = roles.includes('admin')
  const isOfficer = roles.includes('traffic_officer')
  const isDriver = roles.includes('driver')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">SF</span>
          <div>
            <p className="brand-title">SmartFines</p>
            <span className="brand-sub">Traffic compliance</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end>Overview</NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin/officers">Officers</NavLink>
              <NavLink to="/admin/payments">Payments</NavLink>
              <NavLink to="/admin/stats">Statistics</NavLink>
            </>
          )}
          {isOfficer && <NavLink to="/officer/fines">Issue Fines</NavLink>}
          {isDriver && (
            <>
              <NavLink to="/driver/fines">My Fines</NavLink>
              <NavLink to="/driver/payments">Payments</NavLink>
              <NavLink to="/driver/notifications">Notifications</NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div>
            <p className="user-name">{user?.fullName || 'User'}</p>
            <span className="user-role">{roles.join(' · ')}</span>
          </div>
          <button type="button" className="ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="content">
        {children}
      </main>
    </div>
  )
}

export default AppShell
