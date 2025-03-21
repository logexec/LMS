/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { X, FileText, Save, Edit2 } from "lucide-react";
import type { PurchaseOrder } from "@/utils/types";

interface OrderDetailsPanelProps {
  order: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (order: PurchaseOrder) => void;
}

export default function OrderDetailsPanel({
  order,
  isOpen,
  onClose,
  onUpdate,
}: OrderDetailsPanelProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedOrder, setEditedOrder] = React.useState<PurchaseOrder | null>(
    null
  );

  React.useEffect(() => {
    if (order) {
      setEditedOrder(order);
      setIsEditing(false);
    }
  }, [order]);

  if (!order) return null;

  const handleSave = () => {
    if (editedOrder) {
      onUpdate(editedOrder);
      setIsEditing(false);
    }
  };

  const handleInputChange = (field: keyof PurchaseOrder, value: any) => {
    if (editedOrder) {
      setEditedOrder({ ...editedOrder, [field]: value });
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`fixed inset-y-0 right-0 w-[768px] bg-gray-800 shadow-xl transform transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Detalles de la Orden
            </h2>
            <div className="flex items-center space-x-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-indigo-400 hover:text-indigo-300"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center text-green-400 hover:text-green-300"
                >
                  <Save className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400">
                  Número de Orden
                </h3>
                <p className="mt-1 text-lg font-semibold text-white">
                  {editedOrder?.orderNumber}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400">RUC</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedOrder?.ruc}
                    onChange={(e) => handleInputChange("ruc", e.target.value)}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-gray-200">{editedOrder?.ruc}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400">Proyecto</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedOrder?.proyecto}
                    onChange={(e) =>
                      handleInputChange("proyecto", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-gray-200">{editedOrder?.proyecto}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400">
                  Mes de Servicio
                </h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedOrder?.mesDeServicio}
                    onChange={(e) =>
                      handleInputChange("mesDeServicio", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-gray-200">
                    {editedOrder?.mesDeServicio}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400">
                  Código de Cuenta
                </h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedOrder?.accountCode}
                    onChange={(e) =>
                      handleInputChange("accountCode", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-gray-200">
                    {editedOrder?.accountCode}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400">Proveedor</h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedOrder?.vendor}
                    onChange={(e) =>
                      handleInputChange("vendor", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-gray-200">{editedOrder?.vendor}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400">Estado</h3>
                {isEditing ? (
                  <select
                    value={editedOrder?.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="solicitado">Solicitado</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                ) : (
                  <span
                    className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium 
                    ${
                      editedOrder?.status === "aprobado"
                        ? "bg-green-100 text-green-700"
                        : editedOrder?.status === "solicitado"
                        ? "bg-yellow-100 text-yellow-700"
                        : editedOrder?.status === "rechazado"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {editedOrder!.status.charAt(0).toUpperCase() +
                      editedOrder?.status.slice(1)}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Artículos
                </h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="bg-gray-700 p-3 rounded-lg">
                      <p className="font-medium text-white">
                        {item.description}
                      </p>
                      <div className="mt-1 text-sm text-gray-400 flex justify-between">
                        <span>
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </span>
                        <span>${item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between">
                  <span className="font-medium text-white">Total</span>
                  <span className="font-medium text-white">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {order.documents && order.documents.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Documentos
                  </h3>
                  <div className="space-y-2">
                    {order.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                      >
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-300">
                          {doc.name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
