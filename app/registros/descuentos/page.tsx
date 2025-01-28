import ClientTable from "@/app/registros/components/ClientTable";

export default function DescuentosPage() {
  return (
    <ClientTable
      mode="requests"
      type="discount"
      title="Solicitudes de Descuentos"
    />
  );
}
