import { useMemo, useState } from 'react'
import {
  PLACEMENT_CATEGORIES,
  PLACEMENT_RESOURCES,
} from '../data/placementResources'

const categoryStyles = {
  dsa: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  cp: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  core: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  interview: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
}

export default function PlacementResources() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return PLACEMENT_RESOURCES.filter((r) => {
      const matchesCategory = category === 'all' || r.category === category
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [search, category])

  return (
    <div className="relative">
      <div className="absolute -top-40 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-600/10 blur-[100px]" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Placement & <span className="gradient-text">Internships</span>
        </h1>
        <p className="mt-1 text-slate-400">
          Curated DSA sheets, CP practice & interview prep — handpicked for MNITians
        </p>
      </div>

      <div className="glass mb-6 rounded-2xl p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            className="input-field lg:max-w-md"
            placeholder="Search sheets, topics, sources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            {filtered.length} of {PLACEMENT_RESOURCES.length} resources
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PLACEMENT_CATEGORIES.map((cat) => {
            const active = category === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer border ${
                  active
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent'
                    : 'glass text-slate-400 hover:text-white border-white/5 hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-slate-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-white">No resources match your search</p>
          <p className="mt-1 text-sm">Try a different keyword or clear filters</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass card-hover group flex flex-col rounded-2xl border border-white/5 p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="text-3xl">{resource.icon}</span>
                <span
                  className={`badge border capitalize ${
                    categoryStyles[resource.category] || 'bg-white/5 text-slate-300'
                  }`}
                >
                  {PLACEMENT_CATEGORIES.find((c) => c.id === resource.category)?.label}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-brand-300 transition">
                {resource.title}
              </h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-400">
                {resource.description}
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs">
                <span className="text-slate-500">{resource.source}</span>
                <span className="font-semibold text-brand-400 group-hover:text-brand-300">
                  Open ↗
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
