import { useEffect, useState } from 'react'
import { analyticsAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

const branches = [
  'CSE',
  'ECE',
  'EE',
  'ME',
  'CE',
  'CHE',
  'MME',
  'BARCH'
]

export default function Syllabus() {
  const { user } = useAuth()
  const [branch, setBranch] = useState(user?.branch || 'CSE')
  const [syllabus, setSyllabus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    analyticsAPI
      .syllabus(branch)
      .then((r) => setSyllabus(r.data))
      .catch(() => setSyllabus(null))
      .finally(() => setLoading(false))
  }, [branch])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Branch-wise Syllabus</h1>
        <p className="mt-1 text-slate-400">
          Semester subjects for engineering branches
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {branches.map((b) => (
          <button
            key={b}
            onClick={() => setBranch(b)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${branch === b
              ? 'bg-brand-600 text-white'
              : 'glass text-slate-400 hover:text-white'
              }`}
          >
            {b}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading syllabus...</div>
      ) : syllabus?.semesters ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(syllabus.semesters).map(([sem, subjects]) => (
            <div key={sem} className="glass card-hover rounded-2xl p-6">
              <h2 className="mb-4 text-lg font-semibold text-brand-300">
                Semester {sem}
              </h2>
              <ul className="space-y-2">
                {subjects.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <span className="text-brand-500">▸</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl py-16 text-center text-slate-400">
          Syllabus not available for this branch yet
        </div>
      )}
    </div>
  )
}
