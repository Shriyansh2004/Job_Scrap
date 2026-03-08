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
}

export const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedResume, setSelectedResume] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
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
      } catch (err) {
        setError('Could not load profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  // Create preview URL when file is selected
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.')
        return
      }
      // Validate file size (max 5MB)
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
      // Validate file type - only PDF
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file.')
        return
      }
      // Validate file size (max 10MB)
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

      // If an image file is selected, upload it first
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
        image_url: finalImageUrl || null,
      })
      setUser(data)
      setImageUrl(finalImageUrl || '')
      setSelectedFile(null)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSuccess('Profile updated successfully.')
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
      setSuccess('Resume uploaded successfully.')
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

  if (loading) {
    return <p className="text-sm text-slate-400">Loading profile...</p>
  }

  if (!user) {
    return <p className="text-sm text-red-400">Profile not found.</p>
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">
            Profile details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/0 transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Profile image
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-sky-500 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white file:transition file:hover:bg-sky-400"
              />
              {selectedFile && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-slate-400">Selected: {selectedFile.name}</p>
                  <button
                    type="button"
                    onClick={handleCancelImageUpload}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-emerald-400">{success}</p>}

            <button
              type="submit"
              disabled={saving}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Resume Upload Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">
            Resume
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Upload your resume (PDF only, max 10MB)
              </label>
              <input
                type="file"
                ref={resumeInputRef}
                accept=".pdf,application/pdf"
                onChange={handleResumeChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-violet-500 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white file:transition file:hover:bg-violet-400"
              />
              {selectedResume && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-slate-400">Selected: {selectedResume.name}</p>
                  <button
                    type="button"
                    onClick={handleCancelResumeUpload}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {selectedResume && (
              <button
                type="button"
                onClick={handleUploadResume}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Uploading...' : 'Upload Resume'}
              </button>
            )}

            {resumeUrl && !selectedResume && (
              <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-slate-300">Resume uploaded</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-400 hover:text-sky-300"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={handleDeleteResume}
                    disabled={saving}
                    className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">
            Preview & info
          </h3>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-700 bg-slate-800">
              {previewUrl || user.image_url ? (
                <img
                  src={previewUrl || user.image_url || ''}
                  alt={user.full_name || user.email}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-400">
                  No image
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-100">
                {user.full_name || 'Unnamed user'}
              </p>
              <p className="text-xs text-slate-400">{user.email}</p>
              {user.location && (
                <p className="mt-1 text-xs text-slate-400">{user.location}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDeleteImage}
            disabled={saving || (!user.image_url && !previewUrl)}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 shadow-sm shadow-red-500/30 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete image
          </button>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400 shadow-lg shadow-black/40">
          <p className="mb-1 font-semibold text-slate-200">
            CRUD demonstration
          </p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <span className="font-semibold text-slate-200">Create</span> – user
              signup creates a new record in the database.
            </li>
            <li>
              <span className="font-semibold text-slate-200">Read</span> – this
              page loads your profile from the backend.
            </li>
            <li>
              <span className="font-semibold text-slate-200">Update</span> –
              editing the form updates your profile.
            </li>
            <li>
              <span className="font-semibold text-slate-200">Delete</span> –
              "Delete image" clears the image field.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

