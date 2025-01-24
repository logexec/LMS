import React from "react";
import RequestsTable from "../RequestsTable";

const ExpensesPage = () => {
  return (
    <div className="grid grid-rows-[auto_1fr] w-full h-full">
      <div className="flex flex-row justify-between px-5 items-center">
        <h1 className="title">Gastos</h1>
      </div>
      <section className="w-full row-start-2 py-4 px-2">
        <RequestsTable type="expense" />
      </section>
    </div>
  );
};

export default ExpensesPage;
