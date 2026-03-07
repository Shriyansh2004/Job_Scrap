import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Application = {
  id: number
  job_title: string
  company_name: string
  location: string | null
  platform: string
  job_link: string
  date_applied: string
  status: string
}

export const ApplicationsPage = () => {
  const [items, setItems] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get<Application[]>('/applications/me')
        setItems(data)
      } catch (err) {
        setError('Could not load application history.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-100">
          Application history
        </h2>
        <p className="text-xs text-slate-400">
          Every time you click &quot;Apply&quot; from the Jobs page, a record is
          stored here.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
        {loading && <p className="text-sm text-slate-400">Loading...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2 font-medium">Job Title</th>
                  <th className="px-3 py-2 font-medium">Company</th>
                  <th className="px-3 py-2 font-medium">Platform</th>
                  <th className="px-3 py-2 font-medium">Applied</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {items.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-slate-800/60 hover:bg-slate-800/40"
                  >
                    <td className="px-3 py-2 text-sm text-slate-100">
                      {app.job_title}
                    </td>
                    <td className="px-3 py-2 text-xs">{app.company_name}</td>
                    <td className="px-3 py-2 text-xs">{app.platform}</td>
                    <td className="px-3 py-2 text-xs">
                      {new Date(app.date_applied).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span className="inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/30">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-sky-400 underline underline-offset-2">
                      <a
                        href={app.job_link}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-sky-300"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-sm text-slate-500"
                    >
                      No applications stored yet. Use the Jobs page to apply and
                      build your history here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

