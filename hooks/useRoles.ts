'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export function useRoles() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true)
      try {
        if (user) {
          const res = await api.get('/user')
          setRoles([res.user.rol])
        } else {
          setRoles([])
        }
      } catch (error) {
        console.error('Error al obtener roles:', error)
        setRoles([])
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [user])

  const hasRole = (role: string | string[]): boolean => {
    if (Array.isArray(role)) {
      return role.some((r) => roles.includes(r))
    }
    return roles.includes(role)
  }

  return { roles, hasRole, loading }
}
