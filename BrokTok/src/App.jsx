import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import Dashboard from './components/dashboard/Dashboard'
import Uploads from './components/dashboard/Uploads'
import Analytics from './components/dashboard/Analytics'
import ProfilePage from './components/dashboard/Settings'
import Help from './components/dashboard/Help'
import ProtectedRoute from './components/common/ProtectedRoute'
import ManualExpenseForm from './components/expenses/ManualExpenseForm'
import useAuth from './hooks/useAuth'
import ReceiptGallery from "./components/dashboard/Uploads.fixed"
import SettingsPage from './components/dashboard/Settings'
import Landing from './components/Landing/LandingPage'
import About from './components/pages/About'
import Docs from './components/pages/Docs'
// Loading component
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
        <p className="text-white text-lg font-medium">Initializing...</p>
      </div>
    </div>
  )
}
export default function App() {
  const { loading: authLoading } = useAuth()

  if (authLoading) {
    return <LoadingPage />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/about" element={<About />} />
          <Route path="/docs" element={<Docs />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/uploads"
            element={
              <ProtectedRoute>
                <ReceiptGallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-expense"
            element={
              <ProtectedRoute>
                <ManualExpenseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="p-8">
                Not found — <Link to="/">Go home</Link>
              </div>
            }
          />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}
