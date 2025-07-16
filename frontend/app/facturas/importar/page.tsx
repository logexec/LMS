import { Suspense } from 'react'
import Client from './client'

export default function ImportarPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Importar facturas electrónicas</h1>
      <Suspense fallback={<p>Cargando...</p>}>
        <Client />
      </Suspense>
    </div>
  )
}