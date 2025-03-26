import ClientTable from "@/app/registros/components/ClientTable";

export default function GastosPage() {
  return <ClientTable mode="requests" type="expense" title="Gastos" />;
}
