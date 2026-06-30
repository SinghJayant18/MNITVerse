import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { resourcesAPI } from '../api/client'
import { ResourceGrid } from '../components/ResourceCard'

const branches = [
  'CSE',
  'ECE',
  'EE',
  'ME',
  'CE',
  'CHE',
  'MME',
  'AI',
  'BARCH',
]
const types = ['', 'notes', 'pyq', 'book', 'syllabus', 'lab', 'other']

export default function Resources() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    branch: searchParams.get('branch') || '',
    resource_type: searchParams.get('type') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'recent',
  })

  const fetchResources = () => {
    setLoading(true)
    const params = {}
    if (filters.branch) params.branch = filters.branch
    if (filters.resource_type) params.resource_type = filters.resource_type
    if (filters.search) params.search = filters.search
    if (filters.sort) params.sort = filters.sort

    resourcesAPI
      .list(params)
      .then((r) => setResources(r.data))
      .catch(() => setResources([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchResources()
  }, [filters])

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    const params = new URLSearchParams()
    Object.entries(next).forEach(([k, v]) => v && params.set(k === 'resource_type' ? 'type' : k, v))
    setSearchParams(params)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Resources</h1>
        <p className="mt-1 text-slate-400">
          Notes, PYQs, books & syllabi — filter by branch & subject
        </p>
      </div>

      <div className="glass mb-6 rounded-2xl p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            className="input-field lg:col-span-2"
            placeholder="Search title, subject..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
          <select
            className="input-field"
            value={filters.branch}
            onChange={(e) => updateFilter('branch', e.target.value)}
          >
            <option value="" className="bg-slate-900">All Branches</option>
            {branches.filter(Boolean).map((b) => (
              <option key={b} value={b} className="bg-slate-900">{b}</option>
            ))}
          </select>
          <select
            className="input-field"
            value={filters.resource_type}
            onChange={(e) => updateFilter('resource_type', e.target.value)}
          >
            <option value="" className="bg-slate-900">All Types</option>
            {types.filter(Boolean).map((t) => (
              <option key={t} value={t} className="bg-slate-900">{t}</option>
            ))}
          </select>
          <select
            className="input-field"
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            <option value="recent" className="bg-slate-900">Most Recent</option>
            <option value="popular" className="bg-slate-900">Most Downloaded</option>
            <option value="rating" className="bg-slate-900">Top Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading resources...</div>
      ) : (
        <ResourceGrid resources={resources} onBookmarkChange={fetchResources} />
      )}
    </div>
  )
}
