import { Link } from 'react-router-dom'
import { resourcesAPI, bookmarksAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const typeColors = {
  notes: 'bg-blue-500/20 text-blue-300',
  pyq: 'bg-orange-500/20 text-orange-300',
  book: 'bg-green-500/20 text-green-300',
  syllabus: 'bg-purple-500/20 text-purple-300',
  lab: 'bg-pink-500/20 text-pink-300',
  other: 'bg-slate-500/20 text-slate-300',
}

const typeIcons = {
  notes: '📝',
  pyq: '📋',
  book: '📚',
  syllabus: '📑',
  lab: '🔬',
  other: '📄',
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ResourceCard({ resource, onBookmarkChange }) {
  const { user } = useAuth()
  const [bookmarked, setBookmarked] = useState(resource.bookmarked)
  const [rating, setRating] = useState(0)

  const toggleBookmark = async (e) => {
    e.preventDefault()
    if (!user) return
    try {
      if (bookmarked) {
        await bookmarksAPI.remove(resource.id)
        setBookmarked(false)
      } else {
        await bookmarksAPI.add(resource.id)
        setBookmarked(true)
      }
      onBookmarkChange?.()
    } catch {
      /* ignore */
    }
  }

  const handleRate = async (stars) => {
    if (!user) return
    try {
      const res = await resourcesAPI.rate(resource.id, stars)
      setRating(stars)
      resource.avg_rating = res.data.avg_rating
      resource.rating_count = res.data.rating_count
    } catch {
      /* ignore */
    }
  }

  return (
    <Link
      to={`/resources/${resource.id}`}
      className="glass card-hover block rounded-2xl p-5"
    >
      <div className="mb-3 flex items-start justify-between">
        <span className={`badge ${typeColors[resource.resource_type] || typeColors.other}`}>
          {typeIcons[resource.resource_type] || '📄'} {resource.resource_type}
        </span>
        {user && (
          <button
            onClick={toggleBookmark}
            className="text-lg transition hover:scale-110"
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {bookmarked ? '⭐' : '☆'}
          </button>
        )}
      </div>

      <h3 className="mb-1 line-clamp-2 text-base font-semibold text-white">
        {resource.title}
      </h3>
      <p className="mb-3 line-clamp-2 text-sm text-slate-400">
        {resource.description || 'No description'}
      </p>

      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="badge bg-brand-600/20 text-brand-300">{resource.branch}</span>
        <span className="badge bg-white/5 text-slate-400">{resource.subject}</span>
        <span className="badge bg-white/5 text-slate-400">Sem {resource.semester}</span>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-500">
        <span>by {resource.uploader_name}</span>
        <div className="flex items-center gap-3">
          <span>⬇ {resource.downloads}</span>
          <span>★ {resource.avg_rating || '—'} ({resource.rating_count})</span>
          <span>{formatSize(resource.file_size)}</span>
        </div>
      </div>

      {user && (
        <div className="mt-3 flex items-center gap-1" onClick={(e) => e.preventDefault()}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => handleRate(s)}
              className={`text-sm transition hover:scale-125 ${
                s <= (rating || resource.avg_rating) ? 'text-yellow-400' : 'text-slate-600'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      )}
    </Link>
  )
}

export function ResourceGrid({ resources, onBookmarkChange }) {
  if (!resources?.length) {
    return (
      <div className="glass rounded-2xl py-16 text-center text-slate-400">
        <p className="text-4xl mb-3">📭</p>
        <p>No resources found. Be the first to upload!</p>
      </div>
    )
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((r) => (
        <ResourceCard key={r.id} resource={r} onBookmarkChange={onBookmarkChange} />
      ))}
    </div>
  )
}
