import React from "react";
import { AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import "./select.component.css";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";

type Option = {
  value: string | number;
  label: string;
  optionDisabled?: boolean;
  className?: string;
};

type SelectProps = {
  label: string;
  name: string;
  id: string;
  required?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  options?: Option[];
  defaultOption?: string;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  error?: string;
};

const Select: React.FC<SelectProps> = ({
  label,
  name,
  id,
  required = false,
  value,
  onChange,
  className,
  options,
  defaultOption = "Selecciona...",
  disabled = false,
  readonly = false,
  loading = false,
  error,
}) => {
  return (
    <div className="custom-select-group">
      <select
        required={required}
        name={name}
        className={`select ${className ? className : ""}`}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-readonly={readonly}
      >
        <option value="" hidden>
          {defaultOption}
        </option>
        {options?.map((option, idx) => (
          <option
            className={`capitalize ${option.className}`}
            key={`${option.value}-${idx}`}
            value={option.value}
            disabled={option.optionDisabled}
            aria-readonly={readonly}
          >
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor={id} className="select-label">
        {label}
      </label>
      {!readonly && <ChevronDown className="select-icon" size={20} />}
      {loading && (
        <div className="select-loading">
          <Loader2 className="text-primary" size={18} />
        </div>
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
    </div>
  );
};

export default Select;
