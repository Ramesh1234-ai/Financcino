import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { SignInButton, SignUpButton } from '@clerk/clerk-react'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import Dashboard from './components/dashboard/Dashboard'
import Uploads from './components/dashboard/Uploads'
import Analytics from './components/dashboard/Analytics'
import Settings from './components/dashboard/Settings'
import Help from './components/dashboard/Help'
import ProtectedRoute from './components/common/ProtectedRoute'
import ManualExpenseForm from './components/expenses/ManualExpenseForm'
import useAuth from './hooks/useAuth'

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
// Auth pages using Clerk
function LoginPage() {
  const { isSignedIn, loading } = useAuth()
  if (loading) {
    return <LoadingPage />
  }
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Welcome</h1>
        <p className="text-center text-gray-600 mb-8">Sign in to manage your expenses</p>
        <div className="flex justify-center mb-6">
          <SignInButton mode="modal" />
        </div>
        <div className="text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
function SignUpPage() {
  const { isSignedIn, loading } = useAuth()
  if (loading) {
    return <LoadingPage />
  }
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Create Account</h1>
        <p className="text-center text-gray-600 mb-8">Start tracking your expenses today</p>
        <div className="flex justify-center mb-6">
          <SignUpButton mode="modal" />
        </div>
        <div className="text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Sign in
          </Link>
        </div>
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
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
                <Uploads />
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
                <Settings />
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
