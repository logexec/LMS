// CustomPopover.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";

interface CustomPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  content: React.ReactNode;
  width?: string;
}

const CustomPopover: React.FC<CustomPopoverProps> = ({
  isOpen,
  onClose,
  trigger,
  content,
  width = "auto",
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div>
      <div
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={contentRef}
          style={{
            position: "absolute",
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999,
            width: width,
            backgroundColor: "white",
            borderRadius: "0.375rem",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e2e8f0",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default CustomPopover;
