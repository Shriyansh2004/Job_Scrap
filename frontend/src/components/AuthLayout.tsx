import { Navigate, Outlet } from 'react-router-dom'
import { getToken } from '../lib/auth'

export const AuthLayout = () => {
  const token = getToken()

  if (token) {
    return <Navigate to="/jobs" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur">
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">
          Job Scraper Platform
        </h1>
        <p className="mb-8 text-center text-sm text-slate-400">
          Sign in or create an account to manage your applications.
        </p>
        <Outlet />
      </div>
    </div>
  )
}

