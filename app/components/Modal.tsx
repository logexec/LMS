import React from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-[50rem] max-h-[90vh] overflow-auto">
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};
