import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { resourcesAPI, analyticsAPI } from '../api/client'
import { ResourceGrid } from '../components/ResourceCard'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [trending, setTrending] = useState([])
  const [recommended, setRecommended] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    resourcesAPI.trending().then((r) => setTrending(r.data)).catch(() => {})
    analyticsAPI.dashboard().then((r) => setStats(r.data)).catch(() => {})
    if (user) {
      resourcesAPI.recommendations().then((r) => setRecommended(r.data)).catch(() => {})
    }
  }, [user])

  return (
    <div>
      <section className="relative mb-16 overflow-hidden rounded-3xl glass px-6 py-16 text-center sm:px-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-purple-600/10" />
        <div className="relative">
          <p className="mb-4 text-sm font-medium tracking-widest text-brand-400">
            Made by MNITians, for MNITians
          </p>
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
            One Platform  <br /><span className="gradient-text">Endless Learning</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-400">
            Everything from Academics to Placement Prep <br/>
            All in one place
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/resources" className="btn-primary px-8 py-3">
              Browse Resources
            </Link>
            <Link to="/register" className="btn-secondary px-8 py-3">
              Join Free
            </Link>
          </div>
        </div>
      </section>

      {stats && (
        <section className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Resources', value: stats.total_resources, icon: '📚' },
            { label: 'Students', value: stats.total_users, icon: '👨‍🎓' },
            { label: 'Downloads', value: stats.total_downloads, icon: '⬇️' },
            { label: 'Branches', value: stats.by_branch?.length || 0, icon: '🏛️' },
          ].map((s) => (
            <div key={s.label} className="glass card-hover rounded-2xl p-5 text-center">
              <p className="text-2xl">{s.icon}</p>
              <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </section>
      )}

      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">🔥 Trending Resources</h2>
          <Link to="/resources?sort=popular" className="text-sm text-brand-400 hover:underline">
            View all →
          </Link>
        </div>
        <ResourceGrid resources={trending} />
      </section>

      {user && recommended.length > 0 && (
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              ✨ Recommended for {user.branch}
            </h2>
          </div>
          <ResourceGrid resources={recommended} />
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: 'Upload Resources',
            desc: 'Share PDF notes, PYQs, books with classmates',
            to: '/upload',
            icon: '📤',
          },
          {
            title: 'AI Study Tools',
            desc: 'Summarize notes, analyze PYQs, generate viva questions',
            to: '/ai-tools',
            icon: '🤖',
          },
          {
            title: 'Branch Syllabus',
            desc: 'Semester-wise subjects for CSE, ECE, ME, IT & more',
            to: '/syllabus',
            icon: '📋',
          },
        ].map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="glass card-hover rounded-2xl p-6"
          >
            <p className="mb-2 text-3xl">{f.icon}</p>
            <h3 className="mb-1 font-semibold text-white">{f.title}</h3>
            <p className="text-sm text-slate-400">{f.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
