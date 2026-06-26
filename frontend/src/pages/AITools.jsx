import { useState } from 'react'
import { aiAPI } from '../api/client'

const tabs = [
  { id: 'summarize', label: '📝 Notes Summary', desc: 'Summarize long notes into key points' },
  { id: 'pyq', label: '📋 PYQ Analysis', desc: 'Analyze previous year papers' },
  { id: 'viva', label: '🎤 Viva Questions', desc: 'Generate viva voce questions' },
]

export default function AITools() {
  const [activeTab, setActiveTab] = useState('summarize')
  const [text, setText] = useState('')
  const [count, setCount] = useState(5)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (text.length < 10) {
      setError('Please enter at least 10 characters')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      if (activeTab === 'summarize') {
        const res = await aiAPI.summarize(text)
        setResult({ type: 'summarize', data: res.data.summary })
      } else if (activeTab === 'pyq') {
        const res = await aiAPI.analyzePYQ(text)
        setResult({ type: 'pyq', data: res.data })
      } else {
        const res = await aiAPI.vivaQuestions(text, count)
        setResult({ type: 'viva', data: res.data.questions })
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'AI request failed. Check GEMINI_API_KEY.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          AI Study <span className="gradient-text">Assistant</span>
        </h1>
        <p className="mt-1 text-slate-400">
          Powered by Gemini — summarize notes, analyze PYQs & prep for viva
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(null) }}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white'
                : 'glass text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-slate-500">
        {tabs.find((t) => t.id === activeTab)?.desc}
      </p>

      {error && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-6">
        <textarea
          className="input-field min-h-[200px] resize-y font-mono text-sm"
          placeholder="Paste your notes, PYQ text, or study material here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {activeTab === 'viva' && (
          <div>
            <label className="mb-1 block text-sm text-slate-400">Number of questions</label>
            <input
              type="number"
              min={1}
              max={20}
              className="input-field w-32"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </div>
        )}
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? '🤖 AI is thinking...' : '✨ Generate'}
        </button>
      </form>

      {result && (
        <div className="glass mt-6 rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Result</h2>
          {result.type === 'summarize' && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
              {result.data}
            </div>
          )}
          {result.type === 'pyq' && (
            <div className="space-y-4 text-sm">
              <div>
                <span className="badge bg-orange-500/20 text-orange-300">
                  Difficulty: {result.data.difficulty}
                </span>
              </div>
              <div className="whitespace-pre-wrap text-slate-300">{result.data.analysis}</div>
              {result.data.important_topics?.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-white">Important Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.data.important_topics.map((t, i) => (
                      <span key={i} className="badge bg-brand-600/20 text-brand-300">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {result.type === 'viva' && (
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
              {result.data.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
