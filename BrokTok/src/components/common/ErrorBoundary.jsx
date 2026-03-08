// BrokTok/src/components/common/ErrorBoundary.jsx
import React from 'react'
import { AlertCircle } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Could send to error tracking service here (Sentry, etc)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-center mb-4">
              <AlertCircle className="text-red-500" size={48} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 text-center">
              Something went wrong
            </h1>
            <p className="text-gray-300 text-center mb-4 text-sm">
              {this.state.error?.message ||
                'An unexpected error occurred. Please try again.'}
            </p>
            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Go Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-xs text-gray-400">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 bg-gray-950 p-2 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
