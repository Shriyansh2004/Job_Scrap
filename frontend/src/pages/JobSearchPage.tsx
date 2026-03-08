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
    
    // Check if job title contains experience-related keywords
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">
          Scrape job listings
        </h2>
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Job keyword
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/40"
              placeholder="e.g. React Developer"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/40"
              placeholder="e.g. Bengaluru, Remote"
            />
          </div>
          <div className="w-full space-y-1.5 md:w-40">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Experience
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as ExperienceFilter)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/40"
            >
              <option value="all">All</option>
              <option value="fresher">Fresher</option>
              <option value="0-1">0-1 Years</option>
              <option value="1-3">1-3 Years</option>
              <option value="3-5">3-5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70 md:mt-0 md:w-auto"
          >
            {loading ? 'Scraping...' : 'Scrape Jobs'}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-100">Job results</h3>
          <p className="text-xs text-slate-400">
            Showing {filteredResults.length} jobs from LinkedIn, Naukri, Internshala &amp;
            Unstop (demo data).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2 font-medium">Job Title</th>
                <th className="px-3 py-2 font-medium">Company</th>
                <th className="px-3 py-2 font-medium">Location</th>
                <th className="px-3 py-2 font-medium">Platform</th>
                <th className="px-3 py-2 font-medium">Link</th>
                <th className="px-3 py-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((job, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-800/60 hover:bg-slate-800/40"
                >
                  <td className="px-3 py-2 text-sm text-slate-100">
                    {job.job_title}
                  </td>
                  <td className="px-3 py-2 text-xs">{job.company_name}</td>
                  <td className="px-3 py-2 text-xs">
                    {job.location || 'Not specified'}
                  </td>
                  <td className="px-3 py-2 text-xs">{job.platform}</td>
                  <td className="px-3 py-2 text-xs text-sky-400 underline underline-offset-2">
                    <a
                      href={job.job_link}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-sky-300"
                    >
                      View
                    </a>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleApply(job)}
                      className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-emerald-950 shadow-sm shadow-emerald-500/40 transition hover:bg-emerald-400"
                    >
                      Apply
                    </button>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-sm text-slate-500"
                  >
                    {results.length === 0 
                      ? 'No jobs yet. Try searching with a keyword and location.'
                      : 'No jobs match the selected experience filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

