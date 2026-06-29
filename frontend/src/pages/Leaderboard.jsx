import { useEffect, useState } from 'react'
import { leaderboardAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

const BRANCHES = ["CSE", "ECE", "EE", "ME", "CE", "CHE", "MME", "AI"]

export default function Leaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overall') // 'overall', 'lc_solved', 'lc_contest'
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [showFAQ, setShowFAQ] = useState(false)

  // Settings Form State
  const [showSettings, setShowSettings] = useState(false)
  const [leetcodeUsername, setLeetcodeUsername] = useState('')
  const [updating, setUpdating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Sync user handles to local state when user changes
  useEffect(() => {
    if (user) {
      setLeetcodeUsername(user.leetcode_username || '')
    }
  }, [user])

  // Fetch leaderboard data
  const fetchLeaderboard = () => {
    setLoading(true)
    const params = {
      tab: activeTab,
      branch: selectedBranch || undefined,
      year: selectedYear || undefined
    }
    leaderboardAPI.list(params)
      .then((res) => {
        setLeaderboard(res.data)
      })
      .catch((err) => {
        console.error("Failed to load leaderboard data", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [activeTab, selectedBranch, selectedYear])

  // Handle username submit
  const handleSaveUsernames = async (e) => {
    e.preventDefault()
    setUpdating(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      await leaderboardAPI.updateCPUsernames({
        leetcode_username: leetcodeUsername
      })
      setSuccessMsg('Usernames updated successfully!')
      fetchLeaderboard()
      setTimeout(() => {
        setShowSettings(false)
        setSuccessMsg('')
      }, 1500)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update usernames. Please verify they are correct.')
    } finally {
      setUpdating(false)
    }
  }

  // Handle manual stats refresh
  const handleRefreshStats = async () => {
    setRefreshing(true)
    setErrorMsg('')
    try {
      await leaderboardAPI.refreshCPStats()
      setSuccessMsg('Statistics refreshed successfully!')
      fetchLeaderboard()
      setTimeout(() => {
        setSuccessMsg('')
      }, 3000)
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to refresh statistics.')
    } finally {
      setRefreshing(false)
    }
  }

  const renderMedal = (rank) => {
    if (rank === 1) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-bold border border-yellow-500/30">🥇</span>
    if (rank === 2) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300/20 text-slate-300 text-sm font-bold border border-slate-300/30">🥈</span>
    if (rank === 3) return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600/20 text-amber-500 text-sm font-bold border border-amber-600/30">🥉</span>
    return <span className="text-slate-400 font-mono text-sm">#{rank}</span>
  }

  // Get tab column header text
  const getScoreHeader = () => {
    if (activeTab === 'overall') return 'OVERALL SCORE'
    if (activeTab === 'lc_solved') return 'LEETCODE SOLVED SCORE'
    if (activeTab === 'lc_contest') return 'LEETCODE CONTEST RATING'
    return 'SCORE'
  }

  return (
    <div className="relative">
      {/* Background Glow */}
      <div className="absolute -top-40 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-600/10 blur-[100px]" />

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🏆 CP Leaderboard</h1>
          <p className="mt-1 text-slate-400">MNIT Jaipur's Competitive Programming rankings on LeetCode</p>
        </div>

        {/* Action Button for Profile Setup */}
        {user ? (
          <div className="flex items-center gap-2">
            {(user.leetcode_username) && (
              <button
                onClick={handleRefreshStats}
                disabled={refreshing}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {refreshing ? (
                  <>
                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.213 6h-2.293" />
                    </svg>
                    Refresh My Stats
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => {
                setErrorMsg('')
                setSuccessMsg('')
                setShowSettings(!showSettings)
              }}
              className="btn-primary text-xs py-2 px-3 cursor-pointer"
            >
              Your Profile
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Log in to display your ratings on the board</p>
        )}
      </div>

      {/* Inline Feedback Alerts */}
      {successMsg && (
        <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Username Settings Collapse/Drawer */}
      {showSettings && (
        <div className="mb-8 glass rounded-2xl p-6 border border-brand-500/20 relative">
          <h2 className="text-lg font-semibold mb-3">Configure CP Profiles</h2>
          <p className="text-sm text-slate-400 mb-4">
            Enter your LeetCode username. We will check the API to validate it exists and calculate your initial standings. Leave empty to delete the profile link.
          </p>
          <form onSubmit={handleSaveUsernames} className="grid gap-4 md:grid-cols-2 md:items-end">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">LeetCode Username</label>
              <input
                type="text"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="e.g. jsmith_lc"
                className="input-field py-2 px-3 text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                {updating ? 'Validating...' : 'Save & Check'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Tabs Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        {[
          { id: 'overall', label: 'Overall Ranking', desc: 'Solved score (E×1+M×2+H×3) + contest rating', color: 'from-orange-500 to-pink-500' },
          { id: 'lc_contest', label: 'LeetCode Contest', desc: 'LeetCode contest rating standings', color: 'from-yellow-500 to-amber-500' },
          { id: 'lc_solved', label: 'LeetCode Solved', desc: 'Easy×1 + Medium×2 + Hard×3', color: 'from-purple-500 to-pink-500' },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left p-5 rounded-2xl transition-all duration-300 cursor-pointer ${isActive
                ? `bg-gradient-to-br ${tab.color} text-white shadow-lg scale-[1.02] border-none`
                : 'glass hover:bg-white/5 border border-white/5'
                }`}
            >
              <h3 className="font-bold text-lg">{tab.label}</h3>
              <p className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                {tab.desc}
              </p>
            </button>
          )
        })}
      </div>

      {/* Accordion Explanation Dropdown */}
      <div className="mb-6 glass rounded-2xl overflow-hidden border border-white/5">
        <button
          onClick={() => setShowFAQ(!showFAQ)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-slate-300 hover:bg-white/[0.02] transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-pink-500">💡</span>
            <span>How The Unified Leaderboard Works</span>
          </div>
          <span>{showFAQ ? '▲' : '▼'}</span>
        </button>
        {showFAQ && (
          <div className="px-6 pb-6 pt-2 text-xs text-slate-400 leading-relaxed border-t border-white/5 bg-white/[0.01]">
            <p className="mb-2 font-semibold text-slate-300">Scoring Formulas:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Overall score</strong> is calculated as: <code>(Easy × 1 + Medium × 2 + Hard × 3) + LeetCode Contest Rating</code>.</li>
              <li><strong>LeetCode Solved score</strong> is calculated as: <code>Easy solved × 1 + Medium solved × 2 + Hard solved × 3</code>.</li>
              <li>Stats are cached in MongoDB and updated periodically. You can manually refresh your stats using the "Refresh My Stats" button above.</li>
              <li>Invalid usernames (e.g. typos or deleted accounts) will show a warning tag next to the handle and default to 0 stats.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Year Filters Pill Button Row */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: '', label: 'All Years' },
            { id: '1', label: 'First Year' },
            { id: '2', label: 'Second Year' },
            { id: '3', label: 'Third Year' },
            { id: '4', label: 'Fourth Year' },
          ].map((yr) => {
            const isActive = selectedYear === yr.id
            return (
              <button
                key={yr.id}
                onClick={() => setSelectedYear(yr.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer border ${isActive
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-transparent'
                  : 'glass text-slate-400 hover:text-white border-white/5 hover:bg-white/5'
                  }`}
              >
                {yr.label}
              </button>
            )
          })}
        </div>

        {/* Branch Filter dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[150px]">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-brand-500"
            >
              <option value="">All Branches</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b} className="bg-slate-900">{b}</option>
              ))}
            </select>
          </div>

          {selectedBranch && (
            <button
              onClick={() => setSelectedBranch('')}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold cursor-pointer"
            >
              Clear Branch
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <div className="border-b border-white/5 bg-white/[0.01] px-6 py-4 flex justify-between items-center">
          <h2 className="font-bold text-lg capitalize">{activeTab.replace('_', ' ')} Leaderboard</h2>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-400">Live Standings</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading ranking list...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <p className="text-lg font-semibold">No students found matching current filters</p>
            <p className="text-sm mt-1">Configure your CP handles or try clearing branch/year filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6 text-center w-16">Rank</th>
                  <th className="py-4 px-6">Participant</th>
                  <th className="py-4 px-6">Branch & Year</th>

                  <th className="py-4 px-6 text-right">{getScoreHeader()}</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((entry) => {
                  const stats = entry.cp_stats || {}
                  const hasLC = !!entry.leetcode_username
                  const lcValid = stats.lc_valid !== false

                  let scoreDisplay = "0"
                  let scoreColor = "text-white"
                  if (activeTab === 'overall') {
                    scoreDisplay = Number(stats.overall_score || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    scoreColor = "text-white"
                  } else if (activeTab === 'lc_solved') {
                    scoreDisplay = `${stats.lc_solved_total || 0}`
                    scoreColor = "text-yellow-500"
                  } else if (activeTab === 'lc_contest') {
                    scoreDisplay = Number(stats.lc_contest_rating || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    scoreColor = "text-orange-500"
                  }

                  const primaryUrl = hasLC && lcValid
                    ? `https://leetcode.com/${entry.leetcode_username}`
                    : null

                  return (
                    <tr
                      key={entry.id}
                      className={`text-sm transition-colors hover:bg-white/[0.02] ${user && user.id === entry.id ? 'bg-brand-500/5' : ''
                        }`}
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center">
                          {renderMedal(entry.rank)}
                        </div>
                      </td>

                      {/* Name Column */}
                      <td className="py-4 px-6 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span>{entry.name}</span>
                          {user && user.id === entry.id && (
                            <span className="badge bg-brand-600/20 text-brand-300 border border-brand-500/30">You</span>
                          )}
                        </div>
                      </td>

                      {/* Branch & Year Column */}
                      <td className="py-4 px-6 text-slate-400">
                        {entry.branch} · Year {entry.year}
                      </td>



                      {/* Rating/Score Column */}
                      <td className={`py-4 px-6 text-right font-mono font-bold ${scoreColor}`}>
                        {scoreDisplay}
                        {activeTab === 'lc_solved' && (
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5 font-sans">
                            {stats.lc_solved_easy || 0}E · {stats.lc_solved_medium || 0}M · {stats.lc_solved_hard || 0}H
                          </div>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-center">
                        {primaryUrl ? (
                          <a
                            href={primaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 active:scale-[0.98] transition cursor-pointer"
                          >
                            View Profile
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500 italic">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="mt-4 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2 px-2">
        <p>Overall Score = (Easy × 1 + Medium × 2 + Hard × 3) + LeetCode Contest Rating</p>
        {leaderboard.length > 0 && leaderboard[0].cp_stats?.last_updated && (
          <p>
            Last Cached Update: {new Date(leaderboard[0].cp_stats.last_updated).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
