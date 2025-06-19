"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FacturasTable from "../components/facturas/FacturasTable";
import { CheckIcon, ClockFadingIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export default function FacturasPage() {
  const [selectedValue, setSelectedValue] = useState("PREBAM");
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const day = new Date().getDate();
  const today = new Date(year, month, day, 0);
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

        {/* Seccion de Filtros */}
        <div className="bg-white rounded-md border border-gray-200 shadow px-5 py-4 my-2 flex items-center justify-between">
          {/* Mostrar unicamente en la pestana de completas */}
          <div className="flex flex-row items-center justify-evenly space-x-8">
            <div className="flex flex-col">
              <Label htmlFor="from">Desde:</Label>
              <input
                type="date"
                id="from"
                className="border border-gray-300 rouded pl-4 py-1"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="to">Hasta:</Label>
              <input
                type="date"
                id="from"
                value={today}
                className="border border-gray-300 rouded pl-4 py-1"
              />
            </div>
          </div>

          {/* Mostrar siempre */}
          <RadioOptions
            selectedValue={selectedValue}
            onChange={() =>
              setSelectedValue(
                selectedValue === "PREBAM" ? "SERSUPPORT" : "PREBAM"
              )
            }
          />
        </div>

        {/** Contenido **/}

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

function RadioOptions({
  selectedValue,
  onChange,
}: {
  selectedValue: string;
  onChange: () => void;
}) {
  return (
    <div className="bg-input/50 inline-flex h-9 rounded-md p-0.5">
      <RadioGroup
        value={selectedValue}
        onValueChange={onChange}
        className="group after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-sm after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] data-[state=SERSUPPORT]:after:translate-x-0 data-[state=PREBAM]:after:translate-x-full"
        data-state={selectedValue}
      >
        <label className="group-data-[state=PREBAM]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          SERSUPPORT
          <RadioGroupItem
            id={`SERSUPPORT`}
            value="SERSUPPORT"
            className="sr-only"
          />
        </label>
        <label className="group-data-[state=SERSUPPORT]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          <span>PREBAM</span>
          <RadioGroupItem id={`PREBAM`} value="PREBAM" className="sr-only" />
        </label>
      </RadioGroup>
    </div>
  );
}
