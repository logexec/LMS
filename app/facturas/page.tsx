import FacturasTable from "../components/facturas/FacturasTable";


export default function FacturasPage() {
  return (
    <main className="p-6">
      <h2 className="text-xl font-bold mb-4">Listado de Facturas</h2>
      <FacturasTable />
    </main>
  );
}