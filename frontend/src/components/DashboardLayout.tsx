import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearToken } from '../lib/auth'

export const DashboardLayout = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/jobs" className="flex items-center gap-2">
            <span className="rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-sky-400">
              JobScraper
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                `transition hover:text-sky-400 ${
                  isActive ? 'text-sky-400' : 'text-slate-300'
                }`
              }
            >
              Jobs
            </NavLink>
            <NavLink
              to="/applications"
              className={({ isActive }) =>
                `transition hover:text-sky-400 ${
                  isActive ? 'text-sky-400' : 'text-slate-300'
                }`
              }
            >
              Applications
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `transition hover:text-sky-400 ${
                  isActive ? 'text-sky-400' : 'text-slate-300'
                }`
              }
            >
              Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 shadow-sm transition hover:border-red-500/70 hover:bg-red-500/10 hover:text-red-400"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

