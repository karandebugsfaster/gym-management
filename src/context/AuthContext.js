'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedGym, setSelectedGym] = useState(null)
  const router = useRouter()
  const pathname = usePathname()

  // Auto-login on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        const storedGym = localStorage.getItem('selectedGym')

        if (token && storedUser) {
          // Verify token with backend
          const res = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          if (res.ok) {
            const data = await res.json()
            setUser(data.user)
            
            if (storedGym) {
              setSelectedGym(JSON.parse(storedGym))
            }
          } else {
            // Token expired or invalid
            logout()
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    
    // Role-based redirect
    if (userData.role === 'manager') {
      // Manager can only access /manager
      router.push('/manager')
    } else {
      // Owner goes to normal flow
      if (userData.ownedGyms?.length > 0) {
        router.push('/dashboard')
      } else {
        router.push('/gym-info')
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('selectedGym')
    setUser(null)
    setSelectedGym(null)
    if (pathname !== '/') {
      router.push('/')
    }
  }

  const selectGym = (gym) => {
    localStorage.setItem('selectedGym', JSON.stringify(gym))
    setSelectedGym(gym)
  }

  return (
    <AuthContext.Provider value={{ user, loading, selectedGym, login, logout, selectGym }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}