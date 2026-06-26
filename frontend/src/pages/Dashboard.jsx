import { useEffect, useState } from 'react'
import { analyticsAPI } from '../api/client'
import { ResourceGrid } from '../components/ResourceCard'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI
      .dashboard()
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-20 text-center text-slate-400">Loading analytics...</div>
  if (!data) return <div className="py-20 text-center text-slate-400">Could not load analytics</div>

  const maxBranch = Math.max(...data.by_branch.map((b) => b.count), 1)
  const maxType = Math.max(...data.by_type.map((t) => t.count), 1)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="mt-1 text-slate-400">Platform stats & resource insights</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Resources', value: data.total_resources, color: 'from-brand-600 to-brand-400' },
          { label: 'Registered Students', value: data.total_users, color: 'from-purple-600 to-purple-400' },
          { label: 'Total Downloads', value: data.total_downloads, color: 'from-pink-600 to-pink-400' },
          { label: 'Active Branches', value: data.by_branch.length, color: 'from-cyan-600 to-cyan-400' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <p className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
              {s.value}
            </p>
            <p className="mt-1 text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Resources by Branch</h2>
          <div className="space-y-3">
            {data.by_branch.map((b) => (
              <div key={b.branch}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{b.branch}</span>
                  <span className="text-slate-400">{b.count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-brand-500 transition-all"
                    style={{ width: `${(b.count / maxBranch) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {!data.by_branch.length && (
              <p className="text-sm text-slate-500">No data yet</p>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Resources by Type</h2>
          <div className="space-y-3">
            {data.by_type.map((t) => (
              <div key={t.type}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize">{t.type}</span>
                  <span className="text-slate-400">{t.count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-purple-500 transition-all"
                    style={{ width: `${(t.count / maxType) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {!data.by_type.length && (
              <p className="text-sm text-slate-500">No data yet</p>
            )}
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold">🏆 Top Downloaded</h2>
        <ResourceGrid resources={data.top_resources} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">🆕 Recent Uploads</h2>
        <ResourceGrid resources={data.recent_uploads} />
      </section>
    </div>
  )
}
