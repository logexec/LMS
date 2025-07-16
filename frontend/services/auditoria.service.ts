import { AuditLog } from '@/types/auditoria'

export async function fetchAuditoria(): Promise<AuditLog[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auditoria`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Error al cargar auditoría')
  }

  const json = await res.json()
  return json.data as AuditLog[]
}