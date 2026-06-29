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

export default api
