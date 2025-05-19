import { PayrollForm } from "./components/PayrollForm";
import { PayrollList } from "./components/PayrollList";

export default function RolesDePagoPage() {
  return (
    <main className="space-y-6 p-6">
      <PayrollForm />
      <PayrollList />
    </main>
  );
}
