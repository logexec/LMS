/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AuditLog {
  id: number
  log_name: string
  description: string
  subject_id: number | null
  subject_type: string | null
  causer_id: number | null
  causer_type: string | null
  properties: {
    old?: Record<string, any>
    attributes?: Record<string, any>
  }
  created_at: string
}