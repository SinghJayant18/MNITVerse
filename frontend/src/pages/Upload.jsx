import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { resourcesAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

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
const types = ['notes', 'pyq', 'book', 'syllabus', 'lab', 'other']

export default function Upload() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: '',
    description: '',
    branch: user?.branch || 'CSE',
    subject: '',
    semester: '1',
    resource_type: 'notes',
  })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!user) return <Navigate to="/login" replace />

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('file', file)
      await resourcesAPI.upload(fd)
      setSuccess(true)
      setForm({ ...form, title: '', description: '', subject: '' })
      setFile(null)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Resource</h1>
        <p className="mt-1 text-slate-400">
          Share notes, PYQs, books or syllabus with your batchmates
        </p>
      </div>

      {success && (
        <div className="mb-4 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-300">
          Resource uploaded successfully! 🎉
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Title *</label>
          <input
            name="title"
            className="input-field"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="DBMS Unit 3 Notes"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Description</label>
          <textarea
            name="description"
            className="input-field min-h-[80px] resize-y"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of the resource..."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Branch</label>
            <select name="branch" className="input-field" value={form.branch} onChange={handleChange}>
              {branches.map((b) => (
                <option key={b} value={b} className="bg-slate-900">{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Subject *</label>
            <input
              name="subject"
              className="input-field"
              value={form.subject}
              onChange={handleChange}
              required
              placeholder="Database Management Systems"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Semester</label>
            <select name="semester" className="input-field" value={form.semester} onChange={handleChange}>
              {['1', '2', '3', '4', '5', '6', '7', '8'].map((s) => (
                <option key={s} value={s} className="bg-slate-900">Semester {s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Type</label>
            <select name="resource_type" className="input-field" value={form.resource_type} onChange={handleChange}>
              {types.map((t) => (
                <option key={t} value={t} className="bg-slate-900">{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">File (PDF, DOC, PPT, TXT, ZIP — max 20MB)</label>
          <input
            type="file"
            className="input-field file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:text-white"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Uploading...' : '📤 Upload Resource'}
        </button>
      </form>
    </div>
  )
}
