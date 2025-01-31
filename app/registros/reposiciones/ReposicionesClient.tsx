"use client";

import { RequestsTable } from "../components/table/RequestsTable";
import { ReposicionProps } from "@/utils/types";

export default function ReposicionesClient() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Reposiciones</h1>
      <RequestsTable<ReposicionProps> mode="reposiciones" />
    </div>
  );
}
