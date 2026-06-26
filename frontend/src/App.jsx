import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Resources from './pages/Resources'
import Upload from './pages/Upload'
import ResourceDetail from './pages/ResourceDetail'
import AITools from './pages/AITools'
import Dashboard from './pages/Dashboard'
import Bookmarks from './pages/Bookmarks'
import Syllabus from './pages/Syllabus'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="resources" element={<Resources />} />
            <Route path="resources/:id" element={<ResourceDetail />} />
            <Route path="upload" element={<Upload />} />
            <Route path="ai-tools" element={<AITools />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="syllabus" element={<Syllabus />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
