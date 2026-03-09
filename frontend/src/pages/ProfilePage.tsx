
import type { FormEvent, ChangeEvent } from 'react'
import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'

type User = {
  id: number
  email: string
  full_name?: string | null
  location?: string | null
  bio?: string | null
  image_url?: string | null
  resume_url?: string | null
  skills?: string | null
}

type ParsedResume = {
  name?: string | null
  email?: string | null
  mobile_number?: string | null
  skills: string[]
  experience: string[]
  education: { [key: string]: string }[]
  company_names: string[]
  college_name?: string | null
  degree?: string | null
  designation?: string | null
  total_experience?: number | null
}

// Icons as components
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const SkillsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

export const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedResume, setSelectedResume] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // AI Resume Parser state
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null)
  const [parsingResume, setParsingResume] = useState(false)
  const [selectedResumeToParse, setSelectedResumeToParse] = useState<File | null>(null)
  const resumeParseInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get<User>('/users/me')
        setUser(data)
        setFullName(data.full_name || '')
        setLocation(data.location || '')
        setBio(data.bio || '')
        setImageUrl(data.image_url || '')
        setResumeUrl(data.resume_url || '')
        setSkills(data.skills || '')
      } catch (err) {
        setError('Could not load profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [selectedFile])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB.')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Resume size must be less than 10MB.')
        return
      }
      setSelectedResume(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      let finalImageUrl = imageUrl

      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)

        const { data: uploadData } = await api.post<{ url: string }>('/users/me/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        finalImageUrl = uploadData.url
      }

      const { data } = await api.put<User>('/users/me', {
        full_name: fullName,
        location,
        bio,
        skills,
        image_url: finalImageUrl || null,
      })
      setUser(data)
      setImageUrl(finalImageUrl || '')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSuccess('Profile updated successfully!')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Could not update profile.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleUploadResume = async () => {
    if (!selectedResume) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const formData = new FormData()
      formData.append('file', selectedResume)

      const { data: uploadData } = await api.post<{ url: string }>('/users/me/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      setResumeUrl(uploadData.url)
      setSelectedResume(null)
      if (resumeInputRef.current) {
        resumeInputRef.current.value = ''
      }
      setSuccess('Resume uploaded successfully!')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Could not upload resume.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteResume = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { data } = await api.delete<User>('/users/me/resume')
      setUser(data)
      setResumeUrl('')
      setSelectedResume(null)
      if (resumeInputRef.current) {
        resumeInputRef.current.value = ''
      }
      setSuccess('Resume removed.')
    } catch (err) {
      setError('Could not delete resume.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { data } = await api.delete<User>('/users/me/image')
      setUser(data)
      setImageUrl('')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSuccess('Profile image removed.')
    } catch (err) {
      setError('Could not delete image.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelImageUpload = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCancelResumeUpload = () => {
    setSelectedResume(null)
    if (resumeInputRef.current) {
      resumeInputRef.current.value = ''
    }
  }

  const handleResumeParseChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF or DOCX file.')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Resume size must be less than 10MB.')
        return
      }
      setSelectedResumeToParse(file)
      setError(null)
    }
  }

  const handleParseResume = async () => {
    if (!selectedResumeToParse) return
    setParsingResume(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', selectedResumeToParse)

      const { data } = await api.post<ParsedResume>('/resume/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      setParsedResume(data)
      setSuccess('Resume parsed! Review and apply the extracted data.')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Could not parse resume.'
      setError(errorMessage)
    } finally {
      setParsingResume(false)
    }
  }

  const handleApplyParsedData = async () => {
    if (!parsedResume || !user) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { data } = await api.put<User>('/resume/update-profile', {
        skills: parsedResume.skills,
        experience: parsedResume.experience?.join('\n'),
      })
      
      setUser(data)
      setSkills(data.skills || '')
      setBio(data.bio || '')
      setParsedResume(null)
      setSelectedResumeToParse(null)
      if (resumeParseInputRef.current) {
        resumeParseInputRef.current.value = ''
      }
      setSuccess('Skills extracted and applied to your profile!')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Could not apply parsed data.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelParseResume = () => {
    setSelectedResumeToParse(null)
    setParsedResume(null)
    if (resumeParseInputRef.current) {
      resumeParseInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  if (!user) {
    return <p className="text-sm text-red-400">Profile not found.</p>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiMzMzkiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-2xl overflow-hidden border-4 border-sky-500/30 bg-slate-800 shadow-2xl shadow-sky-500/20">
              {previewUrl || user.image_url ? (
                <img
                  src={previewUrl || user.image_url || ''}
                  alt={user.full_name || user.email}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                  <UserIcon />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <CheckIcon />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-1">
              {user.full_name || 'Welcome!'}
            </h1>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <MailIcon />
                {user.email}
              </span>
              {user.location && (
                <span className="flex items-center gap-1">
                  <LocationIcon />
                  {user.location}
                </span>
              )}
            </div>
            {user.skills && (
              <div className="flex flex-wrap gap-2 mt-3">
                {user.skills.split(',').slice(0, 5).map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 text-xs font-medium rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {skill.trim()}
                  </span>
                ))}
                {user.skills.split(',').length > 5 && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-700 text-slate-400">
                    +{user.skills.split(',').length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl p-6 shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-sky-500/20">
                <UserIcon />
              </div>
              <h2 className="text-xl font-semibold text-white">Profile Details</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                  <SkillsIcon />
                  Skills
                </label>
                <textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows={3}
                  placeholder="Python, JavaScript, React, AWS..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all resize-none"
                />
                <p className="text-xs text-slate-500">Separate skills with commas</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Profile Image</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500 cursor-pointer transition-all"
                  >
                    <UploadIcon />
                    Choose Image
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-sky-400">{selectedFile.name}</span>
                  )}
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={handleCancelImageUpload}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                  <CheckIcon />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Resume Upload Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl p-6 shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-violet-500/20">
                <DocumentIcon />
              </div>
              <h2 className="text-xl font-semibold text-white">Resume</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={resumeInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleResumeChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500 cursor-pointer transition-all"
                >
                  <UploadIcon />
                  Choose PDF
                </label>
                {selectedResume && (
                  <span className="text-sm text-violet-400">{selectedResume.name}</span>
                )}
                {selectedResume && (
                  <button
                    type="button"
                    onClick={handleCancelResumeUpload}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {selectedResume && (
                <button
                  type="button"
                  onClick={handleUploadResume}
                  disabled={saving}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {saving ? 'Uploading...' : 'Upload Resume'}
                </button>
              )}

              {resumeUrl && !selectedResume && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-600/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/20">
                      <DocumentIcon />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Resume uploaded</p>
                      <p className="text-xs text-slate-400">PDF Document</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg text-sky-400 hover:bg-sky-500/20 transition-colors"
                    >
                      <ExternalLinkIcon />
                    </a>
                    <button
                      type="button"
                      onClick={handleDeleteResume}
                      disabled={saving}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Resume Parser Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl p-6 shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                  <SparklesIcon />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">AI Resume Parser</h2>
                  <p className="text-xs text-slate-400">Automatically extract skills & experience</p>
                </div>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                AI Powered
              </span>
            </div>
            
            {!parsedResume ? (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-slate-900/30 border-2 border-dashed border-slate-600/50 text-center">
                  <input
                    type="file"
                    ref={resumeParseInputRef}
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeParseChange}
                    className="hidden"
                    id="ai-resume-upload"
                  />
                  <label
                    htmlFor="ai-resume-upload"
                    className="cursor-pointer"
                  >
                    <div className="p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <UploadIcon />
                    </div>
                    <p className="text-white font-medium mb-1">
                      {selectedResumeToParse ? selectedResumeToParse.name : 'Drop your resume here'}
                    </p>
                    <p className="text-xs text-slate-400">PDF or DOCX, max 10MB</p>
                  </label>
                  {selectedResumeToParse && (
                    <button
                      type="button"
                      onClick={handleCancelParseResume}
                      className="mt-4 text-sm text-red-400 hover:text-red-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {selectedResumeToParse && (
                  <button
                    type="button"
                    onClick={handleParseResume}
                    disabled={parsingResume}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {parsingResume ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <SparklesIcon />
                        Parse with AI
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 mb-3">
                    <CheckIcon />
                    <span className="font-medium">Successfully Parsed!</span>
                  </div>
                  
                  {parsedResume.name && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Name</p>
                      <p className="text-white font-medium">{parsedResume.name}</p>
                    </div>
                  )}
                  
                  {parsedResume.total_experience !== undefined && parsedResume.total_experience !== null && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Experience</p>
                      <p className="text-white">{parsedResume.total_experience} years</p>
                    </div>
                  )}
                  
                  {parsedResume.skills && parsedResume.skills.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Skills Found</p>
                      <div className="flex flex-wrap gap-2">
                        {parsedResume.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {parsedResume.company_names && parsedResume.company_names.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Companies</p>
                      <div className="flex flex-wrap gap-2">
                        {parsedResume.company_names.slice(0, 3).map((company, idx) => (
                          <span key={idx} className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleApplyParsedData}
                    disabled={saving}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    ) : (
                      <>
                        <CheckIcon />
                        Apply to Profile
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelParseResume}
                    disabled={saving}
                    className="px-4 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl p-6 shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <h3 className="text-lg font-semibold text-white mb-4">Profile Completion</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Profile Photo</span>
                <span className={user.image_url ? 'text-emerald-400' : 'text-amber-400'}>
                  {user.image_url ? 'Uploaded' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Resume</span>
                <span className={user.resume_url ? 'text-emerald-400' : 'text-amber-400'}>
                  {user.resume_url ? 'Uploaded' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Skills</span>
                <span className={user.skills ? 'text-emerald-400' : 'text-amber-400'}>
                  {user.skills ? `${user.skills.split(',').length} skills` : 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Location</span>
                <span className={user.location ? 'text-emerald-400' : 'text-amber-400'}>
                  {user.location ? 'Set' : 'Not set'}
                </span>
              </div>
            </div>
            
            {user.image_url && (
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={saving}
                className="w-full mt-6 py-2.5 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
              >
                Remove Profile Photo
              </button>
            )}
          </div>

          {/* Tips Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl p-6 shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <h3 className="text-lg font-semibold text-white mb-4">💡 Pro Tips</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                Add your skills to get better job recommendations
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                Upload a resume to apply to jobs quickly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                Use the AI parser to extract skills from your resume
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                Keep your profile updated for better visibility
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

