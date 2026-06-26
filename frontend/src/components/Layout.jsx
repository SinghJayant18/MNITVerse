import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/resources', label: 'Browse' },
  { to: '/upload', label: 'Upload', auth: true },
  { to: '/ai-tools', label: 'AI Tools' },
  { to: '/syllabus', label: 'Syllabus' },
  { to: '/dashboard', label: 'Analytics' },
  { to: '/bookmarks', label: 'Bookmarks', auth: true },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen hero-glow">
      <nav className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold">
              E
            </div>
            <span className="text-lg font-bold tracking-tight">
              MNIT  <span className="gradient-text">VERSE</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks
              .filter((l) => !l.auth || user)
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-600/20 text-brand-300'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">
                    {user.branch} · Year {user.year}
                  </p>
                </div>
                <button onClick={logout} className="btn-secondary text-xs py-2 px-3">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-xs py-2 px-3">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-xs py-2 px-3">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500">
      <p>MNITVerse — Made by MNITians, for MNITians ❤️ </p> 
        <p>Notes, PYQs, AI Tools & Resources for every MNITian</p>
      </footer>
    </div>
  )
}
