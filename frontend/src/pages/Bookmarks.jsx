import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { bookmarksAPI } from '../api/client'
import { ResourceGrid } from '../components/ResourceCard'
import { useAuth } from '../context/AuthContext'

export default function Bookmarks() {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBookmarks = () => {
    bookmarksAPI
      .list()
      .then((r) => setBookmarks(r.data))
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user) fetchBookmarks()
  }, [user])

  if (!user) return <Navigate to="/login" replace />

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">⭐ My Bookmarks</h1>
        <p className="mt-1 text-slate-400">Resources you saved for later</p>
      </div>
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading...</div>
      ) : (
        <ResourceGrid resources={bookmarks} onBookmarkChange={fetchBookmarks} />
      )}
    </div>
  )
}
