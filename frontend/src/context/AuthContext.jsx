import { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authAPI
        .me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('token', res.data.access_token)
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (data) => {
    // Just requests verification email/OTP creation
    const res = await authAPI.register(data)
    return res.data
  }

  const verifyOTP = async (email, otp) => {
    const res = await authAPI.verifyOTP({ email, otp })
    localStorage.setItem('token', res.data.access_token)
    setUser(res.data.user)
    return res.data.user
  }

  const resendOTP = async (email) => {
    const res = await authAPI.resendOTP({ email })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOTP, resendOTP, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
