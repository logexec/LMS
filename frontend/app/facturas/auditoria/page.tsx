import { AuditoriaTable } from '@/app/components/auditoria/AuditoriaTable'
import { fetchAuditoria } from '@/services/auditoria.service'

export default async function AuditoriaPage() {
  const logs = await fetchAuditoria()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Auditoría de cambios</h1>
      <AuditoriaTable logs={logs} />
    </div>
  )
}