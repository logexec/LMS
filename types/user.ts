/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  id: number
  nombre: string
  cedula: string
  rol: 'admin' | 'vendedor' | 'cliente'
  email: string
  permissions: any
}