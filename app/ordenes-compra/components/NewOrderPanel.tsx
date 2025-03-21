/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { X, Plus, Trash2, Upload, FileText } from "lucide-react";

interface NewOrderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: any) => void;
}

export default function NewOrderPanel({
  isOpen,
  onClose,
  onSubmit,
}: NewOrderPanelProps) {
  const [items, setItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [documents, setDocuments] = useState<File[]>([]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    // Convert files to document objects
    const documentObjects = documents.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // In a real app, you'd upload to a server and get a permanent URL
    }));

    const order = {
      ruc: formData.get("ruc"),
      proyecto: formData.get("proyecto")?.toString().toUpperCase(),
      mesDeServicio: formData.get("mesDeServicio"),
      accountCode: formData.get("accountCode"),
      vendor: formData.get("vendor"),
      items: items.map((item, index) => ({
        description: formData.get(`items[${index}].description`),
        quantity: Number(formData.get(`items[${index}].quantity`)),
        unitPrice: Number(formData.get(`items[${index}].unitPrice`)),
      })),
      documents: documentObjects,
    };
    onSubmit(order);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity z-30 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`fixed inset-y-0 right-0 w-[768px] bg-white shadow-xl transform transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              New Purchase Order
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="ruc"
                  className="block text-sm font-medium text-gray-700"
                >
                  RUC
                </label>
                <input
                  type="text"
                  name="ruc"
                  id="ruc"
                  pattern="[0-9]{10}"
                  required
                  maxLength={10}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="1234567890"
                />
              </div>

              <div>
                <label
                  htmlFor="proyecto"
                  className="block text-sm font-medium text-gray-700"
                >
                  Proyecto
                </label>
                <input
                  type="text"
                  name="proyecto"
                  id="proyecto"
                  required
                  pattern="[A-Za-z]{4}"
                  maxLength={4}
                  className="mt-1 block w-full uppercase rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="ABCD"
                />
              </div>

              <div>
                <label
                  htmlFor="mesDeServicio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mes De Servicio
                </label>
                <input
                  type="text"
                  name="mesDeServicio"
                  id="mesDeServicio"
                  required
                  pattern="[0-9]{2}-[0-9]{2}"
                  maxLength={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="24-03"
                />
              </div>

              <div>
                <label
                  htmlFor="accountCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Account Code
                </label>
                <input
                  type="text"
                  name="accountCode"
                  id="accountCode"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="vendor"
                  className="block text-sm font-medium text-gray-700"
                >
                  Vendor
                </label>
                <input
                  type="text"
                  name="vendor"
                  id="vendor"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items
                </label>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Item {index + 1}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <input
                            type="text"
                            name={`items[${index}].description`}
                            placeholder="Description"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <input
                              type="number"
                              name={`items[${index}].quantity`}
                              placeholder="Quantity"
                              min="1"
                              required
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              name={`items[${index}].unitPrice`}
                              placeholder="Unit Price"
                              min="0"
                              step="0.01"
                              required
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-4 flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                </div>
              </div>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
