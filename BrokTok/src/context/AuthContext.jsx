import React, { createContext, useEffect, useState } from 'react'
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react'

export const AuthContext = createContext(null)

/**
 * AuthProvider - Clerk-based authentication
 * Synchronizes Clerk authentication with local app state
 */
export function AuthProvider({ children }) {
  const clerkUser = useUser()
  const clerk = useClerk()
  const clerkAuth = useClerkAuth()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Sync Clerk user to local state
  useEffect(() => {
    try {
      // Check if Clerk has finished loading
      if (clerkUser && typeof clerkUser.isLoaded !== 'undefined') {
        setLoading(false)

        if (clerkUser?.isSignedIn && clerkUser.user) {
          const clerkUserObj = clerkUser.user
          const localUser = {
            id: clerkUserObj.id,
            email:
              clerkUserObj.primaryEmailAddress?.emailAddress ||
              (clerkUserObj.emailAddresses && clerkUserObj.emailAddresses[0]?.emailAddress) ||
              clerkUserObj.email,
            firstName: clerkUserObj.firstName || '',
            lastName: clerkUserObj.lastName || '',
            fullName: `${clerkUserObj.firstName || ''} ${clerkUserObj.lastName || ''}`.trim() || clerkUserObj.username || clerkUserObj.id,
            image: clerkUserObj.imageUrl,
          }
          setUser(localUser)
          localStorage.setItem('auth_user', JSON.stringify(localUser))
        } else {
          setUser(null)
          localStorage.removeItem('auth_user')
        }
      }
    } catch (err) {
      console.error('Auth sync error:', err)
      setError(err.message)
      setLoading(false)
    }
  }, [clerkUser?.isLoaded, clerkUser?.isSignedIn, clerkUser?.user])

  // Get Clerk token for API calls
  const getToken = async () => {
    try {
      if (clerkAuth?.isSignedIn && clerkAuth.getToken) {
        const token = await clerkAuth.getToken()
        return token
      }
      return null
    } catch (err) {
      console.error('Failed to get Clerk token:', err)
      return null
    }
  }

  const logout = async () => {
    try {
      if (clerk?.signOut) {
        await clerk.signOut()
      }
      setUser(null)
      localStorage.removeItem('auth_user')
      setError(null)
    } catch (err) {
      setError(err.message || 'Logout failed')
    }
  }

  const value = {
    user,
    loading,
    error,
    isSignedIn: clerkUser?.isSignedIn || false,
    getToken,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export default AuthContext
