
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

// Icons
const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

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

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'naukri':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'internshala':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'unstop':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'interview':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMzMzkiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
              <ChartIcon />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Application History</h1>
              <p className="text-slate-400">Track all your job applications in one place</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-2xl font-bold text-white">{items.length}</p>
              <p className="text-sm text-slate-400">Total Applied</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-2xl font-bold text-emerald-400">
                {items.filter(i => i.status === 'Applied').length}
              </p>
              <p className="text-sm text-slate-400">Applied</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-2xl font-bold text-sky-400">
                {items.filter(i => i.status === 'Interview').length}
              </p>
              <p className="text-sm text-slate-400">Interview</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-2xl font-bold text-purple-400">
                {new Set(items.map(i => i.company_name)).size}
              </p>
              <p className="text-sm text-slate-400">Companies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
        
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          )}
          
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
              {error}
            </div>
          )}

          {!loading && !error && (
            items.length > 0 ? (
              <div className="grid gap-4">
                {items.map((app) => (
                  <div
                    key={app.id}
                    className="group relative overflow-hidden rounded-xl bg-slate-900/50 border border-slate-700/50 p-5 hover:border-emerald-500/30 hover:bg-slate-900/70 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="p-3 rounded-xl bg-slate-800/50">
                          <DocumentIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-white truncate">
                              {app.job_title}
                            </h3>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                          <p className="text-slate-300 font-medium mb-2">{app.company_name}</p>
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getPlatformColor(app.platform)}`}>
                              {app.platform}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <CalendarIcon />
                              {formatDate(app.date_applied)}
                            </span>
                            {app.location && (
                              <span className="text-xs text-slate-400">
                                📍 {app.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <a
                        href={app.job_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors text-sm font-medium"
                      >
                        <ExternalLinkIcon />
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="p-4 rounded-full bg-slate-800/50 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <DocumentIcon />
                </div>
                <p className="text-lg font-medium text-white mb-2">No applications yet</p>
                <p className="text-sm text-slate-400">
                  Use the Jobs page to apply and build your history here.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

