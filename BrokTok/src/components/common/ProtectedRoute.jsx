import React from 'react'
import { Navigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
	const { isSignedIn, loading } = useAuth()

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
					<p className="text-white text-lg font-medium">Authenticating...</p>
				</div>
			</div>
		)
	}

	if (!isSignedIn) {
		return <Navigate to="/login" replace />
	}

	return children
}