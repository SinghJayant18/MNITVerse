import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
const years = ['1', '2', '3', '4']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: 'CSE',
    year: '1',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="glass rounded-3xl p-8">
        <h1 className="mb-2 text-center text-2xl font-bold">Create Account</h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Join MNITVerse — Share, Learn & Grow with the MNIT Community
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Full Name</label>
            <input
              name="name"
              className="input-field"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Jayant Singh"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Email</label>
            <input
              name="email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="roll_number@mnit.ac.in"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Password</label>
            <input
              name="password"
              type="password"
              className="input-field"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Min 6 characters"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Branch</label>
              <select
                name="branch"
                className="input-field"
                value={form.branch}
                onChange={handleChange}
              >
                {branches.map((b) => (
                  <option key={b} value={b} className="bg-slate-900">
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Year</label>
              <select
                name="year"
                className="input-field"
                value={form.year}
                onChange={handleChange}
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-slate-900">
                    Year {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up Free'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
