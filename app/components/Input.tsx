import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle } from "lucide-react";
import "./input.component.css";

type InputProps = {
  label: string;
  name: string;
  id: string;
  required?: boolean;
  type: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  currentDate?: boolean;
  maxLength?: number;
  minLength?: number;
  isIdentification?: boolean;
  step?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  pattern?: string;
  numericInput?: boolean;
  containerClassName?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  allowPastDates?: boolean;
  min?: number;
  readonly?: boolean;
};

const handleNumericInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    ".",
    ",",
    "-",
  ];

  if (!/\d/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};

const Input: React.FC<InputProps> = ({
  label,
  name,
  id,
  currentDate = false,
  placeholder,
  required = false,
  type,
  value,
  onChange,
  className,
  maxLength,
  minLength,
  step,
  error,
  hint,
  pattern,
  icon,
  disabled,
  onKeyDown,
  numericInput,
  containerClassName,
  allowPastDates = true,
  min,
  readonly,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasValue = value !== undefined && value !== "";
  const showLabel = isFocused || hasValue;

  return (
    <div className={`custom-input-container ${containerClassName}`}>
      <motion.div
        className={`custom-input-group ${error ? "has-error" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          scale: isHovered ? 1.001 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.input
          required={required}
          type={type}
          name={name}
          className={`input ${className || ""} ${icon ? "has-icon" : ""}`}
          id={id}
          value={
            value || (currentDate ? new Date().toISOString().split("T")[0] : "")
          }
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          step={step}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          animate={{
            borderColor: error
              ? "#ef4444"
              : isFocused
              ? "var(--primary)"
              : isHovered
              ? "#666666"
              : "#9e9e9e",
          }}
          transition={{ duration: 0.2 }}
          disabled={disabled}
          pattern={pattern}
          onKeyDown={numericInput ? handleNumericInput : onKeyDown}
          min={allowPastDates ? min : new Date().toISOString().split("T")[0]}
          readOnly={readonly}
        />

        <motion.label
          htmlFor={id}
          className="user-label"
          initial={false}
          animate={{
            y: showLabel ? -12 : type === "date" ? -12 : 8,
            scale: showLabel ? 0.8 : 1,
            x: showLabel ? -10 : 0,
            color: error ? "#ef4444" : isFocused ? "var(--primary)" : "#a8a8a8",
          }}
          transition={{ duration: 0.2 }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>

        {icon && (
          <motion.div
            className="input-icon"
            animate={{
              color: error
                ? "#ef4444"
                : isFocused
                ? "var(--primary)"
                : "#a8a8a8",
            }}
          >
            {icon}
          </motion.div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              className="input-error-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <AlertCircle className="text-red-500" size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className={`input-footer ${error ? "block" : "hidden"}`}>
        <AnimatePresence>
          {error && (
            <motion.span
              className="input-error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hint && !error && (
            <motion.span
              className="input-hint"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {hint}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Input;
