import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ClerkProvider } from '@clerk/clerk-react'

// Get Clerk publishable key from environment
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Fallback if key is missing (for development)
if (!clerkKey) {
  console.warn('⚠️  VITE_CLERK_PUBLISHABLE_KEY is not set. Please add it to .env file.')
  console.warn('   Get your key from https://dashboard.clerk.com')
}

const rootElement = document.getElementById('root')

if (clerkKey) {
  // ✅ CORRECT: ClerkProvider wraps EVERYTHING (must be outermost provider)
  createRoot(rootElement).render(
    <ClerkProvider publishableKey={clerkKey}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ClerkProvider>
  )
} else {
  // Fallback UI for missing Clerk key
  createRoot(rootElement).render(
    <div className="flex items-center justify-center w-screen h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
        <p className="text-gray-700 mb-4">
          Clerk authentication key is not configured.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 mb-6">
          <li>Visit <a href="https://dashboard.clerk.com" className="text-blue-600 underline" target="_blank" rel="noreferrer">dashboard.clerk.com</a></li>
          <li>Create a new application</li>
          <li>Copy your Publishable Key</li>
          <li>Add to <code className="bg-gray-200 px-1">BrokTok/.env</code>:</li>
          <li><code className="bg-gray-200 px-2 py-1 block mt-2">VITE_CLERK_PUBLISHABLE_KEY=your_key_here</code></li>
          <li>Reload this page</li>
        </ol>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}