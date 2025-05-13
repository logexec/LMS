"use client";
import React, { useState } from "react";
import TxtUploader from "./components/TxtUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FileTextIcon, TableIcon, FileIcon } from "lucide-react";
import DocumentTable from "./components/DocumentTable";
import ReportsTab from "./components/ReportsTab";

const SRIPage = () => {
  const [activeTab, setActiveTab] = useState("tab-1");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFinishUpload = () => {
    setActiveTab("tab-2");
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <ScrollArea>
        <TabsList className="before:bg-border relative mb-3 h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
          <TabsTrigger
            value="tab-1"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <FileTextIcon
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Cargar archivo
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <TableIcon
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Documentos generados
          </TabsTrigger>
          <TabsTrigger
            value="tab-3"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <FileIcon
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Reportes
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="tab-1">
        <div className="p-4 pt-1">
          <TxtUploader onFinish={handleFinishUpload} />
        </div>
      </TabsContent>
      <TabsContent value="tab-2" className="p-4">
        <DocumentTable refreshTrigger={refreshTrigger} />
      </TabsContent>
      <TabsContent value="tab-3">
        <ReportsTab />
      </TabsContent>
    </Tabs>
  );
};

export default SRIPage;
