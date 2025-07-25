'use client'

import api from '@/lib/api'
import { User } from '@/types/user'
import { routes } from '@/lib/routes'

type LoginPayload = {
  email: string
  password: string
  remember?: boolean
}

export async function login(payload: LoginPayload): Promise<{ user: User }> {
  const response = await api.post(routes.auth.login, payload)
  return response.data
}

export async function logout(): Promise<void> {
  await api.post(routes.auth.logout)
}
