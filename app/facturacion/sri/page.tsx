"use client";
import React, { useState } from "react";
import TxtUploader from "./components/TxtUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BoxIcon, HouseIcon, PanelsTopLeftIcon } from "lucide-react";
import SRIDocumentList from "./components/SRIDocumentList";

const SRIPage = () => {
  const [activeTab, setActiveTab] = useState("tab-1");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <ScrollArea>
        <TabsList className="before:bg-border relative mb-3 h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
          <TabsTrigger
            value="tab-1"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <HouseIcon
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Cargar .txt
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <PanelsTopLeftIcon
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Vista previa/Descarga
          </TabsTrigger>
          <TabsTrigger
            value="tab-3"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <BoxIcon
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Pestaña 3
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="tab-1">
        <div className="text-muted-foreground p-4 pt-1 text-center text-xs">
          <TxtUploader
            onFinish={() => {
              setActiveTab("tab-2");
            }}
          />
        </div>
      </TabsContent>
      <TabsContent value="tab-2">
        <div className="p-4 pt-1">
          <SRIDocumentList />
        </div>
      </TabsContent>

      <TabsContent value="tab-3">
        <p className="text-muted-foreground p-4 pt-1 text-center text-xs">
          Contenido de la pestaña 3
        </p>
      </TabsContent>
    </Tabs>
  );
};

export default SRIPage;
