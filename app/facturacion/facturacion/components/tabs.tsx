import { HouseIcon, PanelsTopLeftIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsComponent() {
  return (
    <Tabs defaultValue="tab-1" className="items-center">
      <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="tab-1"
          className="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary"
        >
          <HouseIcon
            className="mb-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Facturación Electrónica
        </TabsTrigger>
        <TabsTrigger
          value="tab-2"
          className="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary"
        >
          <PanelsTopLeftIcon
            className="mb-1.5 opacity-60"
            size={16}
            aria-hidden="true"
          />
          Notas de venta
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">
        <p className="text-muted-foreground p-4 text-center text-xs">
          Contenido de Facturación Electrónica
        </p>
      </TabsContent>
      <TabsContent value="tab-2">
        <p className="text-muted-foreground p-4 text-center text-xs">
          Contenido de Notas de Venta
        </p>
      </TabsContent>
    </Tabs>
  );
}
