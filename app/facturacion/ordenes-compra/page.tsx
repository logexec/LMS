/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import React, { useState, useCallback } from "react";
import { FileText, ArrowUpRight, Filter } from "lucide-react";
import type { PurchaseOrder } from "@/utils/types";
import NewOrderPanel from "./components/NewOrderPanel";
import OrderDetailsPanel from "./components/OrderDetailsPanel";

const initialOrders: PurchaseOrder[] = [
  {
    id: "1",
    orderNumber: "PO-2024-001",
    vendor: "Office Supplies Co.",
    items: [
      {
        id: "1",
        description: "Desk Chair",
        quantity: 5,
        unitPrice: 199.99,
        total: 999.95,
      },
    ],
    total: 999.95,
    status: "solicitado",
    createdAt: new Date("2024-03-10"),
    dueDate: new Date("2024-03-25"),
  },
  {
    id: "2",
    orderNumber: "PO-2024-002",
    vendor: "Tech Solutions Inc.",
    items: [
      {
        id: "2",
        description: "Monitors",
        quantity: 10,
        unitPrice: 299.99,
        total: 2999.9,
      },
    ],
    total: 2999.9,
    status: "aprobado",
    createdAt: new Date("2024-03-12"),
    dueDate: new Date("2024-03-28"),
  },
];

const statusColors = {
  solicitado: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-green-100 text-green-700",
  rechazado: "bg-red-100 text-red-700",
  cancelado: "bg-gray-100 text-gray-700",
};

export default function OrdenesCompraPage() {
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);

  const handleUpdateOrder = useCallback((updatedOrder: PurchaseOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    setSelectedOrder(updatedOrder);
  }, []);

  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const orderNum = (orders.length + 1).toString().padStart(3, "0");
    return `PO-${year}-${orderNum}`;
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleNewOrder = useCallback(
    (orderData: any) => {
      const newOrder: PurchaseOrder = {
        id: crypto.randomUUID(),
        orderNumber: generateOrderNumber(),
        vendor: orderData.vendor,
        items: orderData.items.map((item: any) => ({
          id: crypto.randomUUID(),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
        total: calculateTotal(orderData.items),
        status: "solicitado",
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        ruc: orderData.ruc,
        proyecto: orderData.proyecto,
        mesDeServicio: orderData.mesDeServicio,
        accountCode: orderData.accountCode,
      };

      setOrders((prevOrders) => [...prevOrders, newOrder]);
    },
    [orders]
  );

  return (
    <>
      <section>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Órdenes de Compra</h2>
            <button
              onClick={() => setIsNewOrderOpen(true)}
              className="flex items-center px-4 py-2 bg-[#dc2626] text-white rounded-lg hover:bg-[#b91c1c] transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Nueva Orden
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar órdenes..."
                className="pl-10 pr-4 py-2 border border-gray-600 text-gray-800 placeholder-gray-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button className="flex items-center px-3 py-2 border border-gray-600 rounded-lg text-gray-700 hover:bg-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Número de Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Fecha de Vencimiento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.vendor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.dueDate.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end space-x-2">
                    {order.documents?.length != undefined &&
                    order.documents.length > 0 ? (
                      <span className="text-gray-400 flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {order.documents?.length || 0}
                      </span>
                    ) : (
                      <span className="flex items-center pointer-events-none">
                        <FileText className="w-4 h-4 mr-1" />
                        No hay documentos
                      </span>
                    )}
                    <button className="text-red-400 hover:text-red-300">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <NewOrderPanel
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onSubmit={handleNewOrder}
      />
      <OrderDetailsPanel
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onUpdate={handleUpdateOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
