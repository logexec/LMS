'use client'

import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { login, logout } from '@/services/auth.service'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }

  const { user, setUser, loading } = context

  const handleLogin = async (email: string, password: string) => {
    const { user } = await login({ email, password })
    setUser(user)
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  return {
    user,
    loading,
    isLoggedIn: !!user,
    login: handleLogin,
    logout: handleLogout,
    hasPermission: context.hasPermission
  }
}