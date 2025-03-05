import ClientTable from "@/app/registros/components/ClientTable";

export default function IngresosPage() {
  return (
    <ClientTable mode="requests" type="income" title="Ingresos Especiales" />
  );
}
