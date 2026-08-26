import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTheme } from '@/store/useTheme'
import { useEasterEgg } from '@/hooks/useEasterEgg'
import CustomCursor from '@/components/shared/CustomCursor'
import ScrollProgress from '@/components/shared/ScrollProgress'
import ScrollToTop from '@/components/shared/ScrollToTop'
import CommandPalette from '@/components/shared/CommandPalette'
import StarField from '@/components/shared/StarField'
import Dock from '@/components/shared/Dock'

// Route-level code splitting — each page becomes its own JS chunk.
// BlogPost is the highest priority: it pulls react-markdown +
// react-syntax-highlighter (~300 KB) that home-page visitors never need.
const Home           = lazy(() => import('@/pages/Home'))
const Blog           = lazy(() => import('@/pages/Blog'))
const ProjectsPage   = lazy(() => import('@/pages/Projects'))
const ProjectDetail  = lazy(() => import('@/pages/ProjectDetail'))
const BlogPost       = lazy(() => import('@/pages/BlogPost'))
const AdminLogin     = lazy(() => import('@/pages/admin/Login'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const NotFound       = lazy(() => import('@/pages/NotFound'))

function AppInner() {
  const { theme } = useTheme()
  useEasterEgg()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <>
      <ScrollToTop />
      <StarField />
      <CustomCursor />
      <ScrollProgress />
      <CommandPalette />
      <Dock />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#111' : '#ffffff',
            color: isDark ? '#fafafa' : '#09090b',
            border: isDark
              ? '1px solid rgba(255,255,255,0.10)'
              : '1px solid rgba(0,0,0,0.10)',
            borderRadius: '12px',
            fontSize: '13px',
            boxShadow: isDark
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 4px 24px rgba(0,0,0,0.08)',
          },
        }}
      />
      <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/blog"            element={<Blog />} />
          <Route path="/projects"        element={<ProjectsPage />} />
          <Route path="/projects/:slug"  element={<ProjectDetail />} />
          <Route path="/blog/:slug"      element={<BlogPost />} />
          <Route path="/admin/login"     element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin"           element={<Navigate to="/admin/login" replace />} />
          <Route path="*"                element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
