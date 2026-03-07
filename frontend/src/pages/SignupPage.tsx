import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { setToken } from '../lib/auth'

export const SignupPage = () => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/signup', {
        email,
        full_name: fullName,
        password,
      })

      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)
      const { data } = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      setToken(data.access_token)
      navigate('/jobs', { replace: true })
    } catch (err) {
      setError('Could not create account. Try a different email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-200">
          Full name
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/40"
          placeholder="Jane Doe"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-200">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/40"
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-200">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/40"
          placeholder="••••••••"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Creating account...' : 'Sign up'}
      </button>
      <p className="text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300">
          Sign in
        </Link>
      </p>
    </form>
  )
}

