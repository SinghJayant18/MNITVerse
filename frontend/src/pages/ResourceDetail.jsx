import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { resourcesAPI, bookmarksAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ResourceDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    resourcesAPI
      .get(id)
      .then((r) => setResource(r.data))
      .catch(() => setResource(null))
      .finally(() => setLoading(false))
  }, [id])

  const toggleBookmark = async () => {
    if (!user) return
    try {
      if (resource.bookmarked) {
        await bookmarksAPI.remove(id)
        setResource({ ...resource, bookmarked: false })
      } else {
        await bookmarksAPI.add(id)
        setResource({ ...resource, bookmarked: true })
      }
    } catch {
      /* ignore */
    }
  }

  const handleDownload = async () => {
    setDownloadError('')
    setDownloading(true)
    try {
      await resourcesAPI.triggerDownload(id, resource.title)
      setResource((prev) => ({ ...prev, downloads: prev.downloads + 1 }))
    } catch (err) {
      setDownloadError(
        err.message || err.response?.data?.detail || 'Download failed. Please try again.',
      )
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Loading...</div>
  if (!resource) return <div className="py-20 text-center text-slate-400">Resource not found</div>

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/resources" className="mb-4 inline-block text-sm text-brand-400 hover:underline">
        ← Back to resources
      </Link>

      <div className="glass rounded-2xl p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="badge bg-brand-600/20 text-brand-300">{resource.resource_type}</span>
          <span className="badge bg-white/5 text-slate-400">{resource.branch}</span>
          <span className="badge bg-white/5 text-slate-400">{resource.subject}</span>
          <span className="badge bg-white/5 text-slate-400">Sem {resource.semester}</span>
        </div>

        <h1 className="mb-2 text-3xl font-bold">{resource.title}</h1>
        <p className="mb-6 text-slate-400">{resource.description || 'No description provided.'}</p>

        <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-400">
          <span>Uploaded by <strong className="text-white">{resource.uploader_name}</strong></span>
          <span>⬇ {resource.downloads} downloads</span>
          <span>★ {resource.avg_rating} ({resource.rating_count} ratings)</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary"
          >
            {downloading ? 'Downloading...' : '⬇ Download File'}
          </button>
          {user && (
            <button onClick={toggleBookmark} className="btn-secondary">
              {resource.bookmarked ? '⭐ Bookmarked' : '☆ Bookmark'}
            </button>
          )}
          <Link to="/ai-tools" className="btn-secondary">
            🤖 Analyze with AI
          </Link>
        </div>
        {downloadError && (
          <p className="mt-3 text-sm text-red-300">{downloadError}</p>
        )}
      </div>
    </div>
  )
}
