
import type { FormEvent } from 'react'
import { useState } from 'react'
import { api } from '../lib/api'

type Job = {
  job_title: string
  company_name: string
  location: string | null
  platform: string
  job_link: string
  experience?: string | null
}

type ExperienceFilter = 'all' | 'fresher' | '0-1' | '1-3' | '3-5' | '5+'

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const BriefcaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

export const JobSearchPage = () => {
  const [keyword, setKeyword] = useState('Software Engineer')
  const [location, setLocation] = useState('Remote')
  const [experience, setExperience] = useState<ExperienceFilter>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Job[]>([])

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/jobs/scrape', { keyword, location })
      setResults(data.results)
    } catch (err) {
      setError('Could not scrape jobs. Make sure you are logged in.')
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = results.filter((job) => {
    if (experience === 'all') return true
    
    const titleLower = job.job_title.toLowerCase()
    
    switch (experience) {
      case 'fresher':
        return titleLower.includes('fresher') || 
               titleLower.includes('entry') || 
               titleLower.includes('junior') ||
               titleLower.includes('intern') ||
               titleLower.includes('graduate')
      case '0-1':
        return titleLower.includes('fresher') || 
               titleLower.includes('entry') || 
               titleLower.includes('junior') ||
               titleLower.includes('intern') ||
               titleLower.includes('graduate') ||
               titleLower.includes('0-1') ||
               titleLower.includes('0-2')
      case '1-3':
        return titleLower.includes('1-3') ||
               titleLower.includes('2-3') ||
               titleLower.includes('mid') ||
               titleLower.includes('associate')
      case '3-5':
        return titleLower.includes('3-5') ||
               titleLower.includes('4-5') ||
               titleLower.includes('senior') ||
               titleLower.includes('lead')
      case '5+':
        return titleLower.includes('5+') ||
               titleLower.includes('senior') ||
               titleLower.includes('lead') ||
               titleLower.includes('principal') ||
               titleLower.includes('manager')
      default:
        return true
    }
  })

  const handleApply = async (job: Job) => {
    window.open(job.job_link, '_blank', 'noopener,noreferrer')
    try {
      await api.post('/applications', {
        job_title: job.job_title,
        company_name: job.company_name,
        location: job.location,
        platform: job.platform,
        job_link: job.job_link,
        status: 'Applied',
      })
    } catch {
      // Swallow error; the main UX is opening the job link
    }
  }

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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMzMzkiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-lg shadow-sky-500/30">
              <SearchIcon />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Find Your Dream Job</h1>
              <p className="text-slate-400">Search across LinkedIn, Naukri, Internshala & Unstop</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <BriefcaseIcon />
                </div>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Job title, keywords..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <MapPinIcon />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                />
              </div>
              <div className="relative">
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value as ExperienceFilter)}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-800/50 border border-slate-600/50 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-800">All Experience</option>
                  <option value="fresher" className="bg-slate-800">Fresher</option>
                  <option value="0-1" className="bg-slate-800">0-1 Years</option>
                  <option value="1-3" className="bg-slate-800">1-3 Years</option>
                  <option value="3-5" className="bg-slate-800">3-5 Years</option>
                  <option value="5+" className="bg-slate-800">5+ Years</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon />
                  Search Jobs
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500"></div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20">
                <BriefcaseIcon />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Job Results</h2>
                <p className="text-sm text-slate-400">
                  {filteredResults.length} {filteredResults.length === 1 ? 'job' : 'jobs'} found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <SparklesIcon />
              <span>Powered by AI Scraper</span>
            </div>
          </div>

          {filteredResults.length > 0 ? (
            <div className="grid gap-4">
              {filteredResults.map((job, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl bg-slate-900/50 border border-slate-700/50 p-5 hover:border-sky-500/30 hover:bg-slate-900/70 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {job.job_title}
                        </h3>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getPlatformColor(job.platform)}`}>
                          {job.platform}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium mb-1">{job.company_name}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon />
                            {job.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a
                        href={job.job_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-sky-500/20 hover:text-sky-400 transition-colors text-sm font-medium"
                      >
                        <ExternalLinkIcon />
                        View
                      </a>
                      <button
                        onClick={() => handleApply(job)}
                        className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="p-4 rounded-full bg-slate-800/50 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <BriefcaseIcon />
              </div>
              <p className="text-lg font-medium text-white mb-2">
                {results.length === 0 ? 'No jobs yet' : 'No jobs match the filter'}
              </p>
              <p className="text-sm text-slate-400">
                {results.length === 0 
                  ? 'Try searching with a keyword and location.'
                  : 'Try adjusting your experience filter.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

