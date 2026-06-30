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
  'AI'
]
const years = ['1', '2', '3', '4']

export default function Register() {
  const { register, verifyOTP, resendOTP } = useAuth()
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
  const [step, setStep] = useState(1) // 1 = input form, 2 = verify OTP
  const [otp, setOtp] = useState('')
  const [verificationSuccess, setVerificationSuccess] = useState('')

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      setStep(2)
      setVerificationSuccess('Verification code sent! Please check your email inbox.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOTP(form.email, otp)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'OTP verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setVerificationSuccess('')
    try {
      await resendOTP(form.email)
      setVerificationSuccess('A new verification code has been sent successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend code. Please try again later.')
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="glass rounded-3xl p-8">
        <h1 className="mb-2 text-center text-2xl font-bold">
          {step === 1 ? 'Create Account' : 'Verify Email'}
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          {step === 1 
            ? 'Join MNITVerse — Share, Learn & Grow with the MNIT Community'
            : `We've sent a 6-digit verification code to ${form.email}`
          }
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {verificationSuccess && (
          <div className="mb-4 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-300">
            {verificationSuccess}
          </div>
        )}

        {step === 1 ? (
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
              {loading ? 'Sending code...' : 'Sign Up Free'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                pattern="\d{6}"
                className="input-field text-center text-xl tracking-widest font-mono"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="000000"
              />
            </div>
            
            <button type="submit" className="btn-primary w-full" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <div className="flex justify-between items-center text-sm mt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-slate-400 hover:text-white transition"
              >
                ← Back
              </button>
              <button 
                type="button" 
                onClick={handleResend} 
                className="text-brand-400 hover:text-brand-300 transition font-semibold"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

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
