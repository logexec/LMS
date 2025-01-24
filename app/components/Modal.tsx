import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

interface ModalProps {
  isOpen?: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-[50rem] max-h-[90vh] overflow-auto"
          >
            <div className="p-6">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body
  );
};
