import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api'
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const resourcesAPI = {
  list: (params) => api.get('/resources', { params }),
  trending: () => api.get('/resources/trending'),
  recommendations: () => api.get('/resources/recommendations'),
  get: (id) => api.get(`/resources/${id}`),
  upload: (formData) =>
    api.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  download: (id) => `${BASE_URL}/resources/${id}/download`,
  triggerDownload: async (id, title) => {
    try {
      const response = await api.get(`/resources/${id}/download`, {
        responseType: 'blob',
      })
      const disposition = response.headers['content-disposition'] || ''
      const match = disposition.match(/filename="?([^";\n]+)"?/)
      const filename = match?.[1] || `${title || 'resource'}.pdf`
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.warn("Blob download failed, attempting direct download fallback...", err)
      // Fallback: direct download by navigating the window to the download URL
      try {
        const downloadUrl = `${BASE_URL}/resources/${id}/download`
        const link = document.createElement('a')
        link.href = downloadUrl
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch (fallbackErr) {
        throw new Error('Download failed to start. Please try again.')
      }
    }
  },
  rate: (id, rating) => api.post(`/resources/${id}/rate`, { rating }),
}

export const bookmarksAPI = {
  list: () => api.get('/bookmarks'),
  add: (id) => api.post(`/bookmarks/${id}`),
  remove: (id) => api.delete(`/bookmarks/${id}`),
}

export const aiAPI = {
  summarize: (text, apiKey) => api.post('/summarize', { text, api_key: apiKey }),
  analyzePYQ: (text, apiKey) => api.post('/ai/analyze-pyq', { text, api_key: apiKey }),
  vivaQuestions: (text, apiKey, count = 5) =>
    api.post('/ai/viva-questions', { text, api_key: apiKey, count }),
}

export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  syllabus: (branch) => api.get(`/analytics/syllabus/${branch}`),
}

export const leaderboardAPI = {
  list: (params) => api.get('/leaderboard', { params }),
  updateCPUsernames: (data) => api.put('/leaderboard/usernames', data),
  refreshCPStats: () => api.post('/leaderboard/refresh'),
}

export default api
