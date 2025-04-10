import ClientTable from "@/app/registros/components/ClientTable";

export default function IncomeReposicionesPage() {
  return (
    <ClientTable
      mode="reposiciones"
      title="Solicitudes de Reposiciones (Ingresos)"
      type="income"
    />
  );
}
