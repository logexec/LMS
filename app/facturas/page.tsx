import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FacturasTable from "../components/facturas/FacturasTable";
import { CheckIcon, ClockFadingIcon } from "lucide-react";

export default function FacturasPage() {
  return (
    <main>
      <Tabs defaultValue="tab-1" className="items-center">
        <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="tab-1"
            className="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-500 data-[state=active]:text-red-700"
          >
            <ClockFadingIcon
              className="mb-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Pendientes
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-gray-500 data-[state=active]:text-red-700"
          >
            <CheckIcon
              className="mb-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Completas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1" className="p-6">
          <FacturasTable />
        </TabsContent>
        <TabsContent value="tab-2" className="p-6">
          <FacturasTable />
        </TabsContent>
      </Tabs>
    </main>
  );
}
