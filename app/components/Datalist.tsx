import React, { useState, useEffect } from "react";
import "./datalist.component.css";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { AlertCircle, Loader2 } from "lucide-react";

type Option = {
  value: string | number;
  label: string;
  optionDisabled?: boolean;
  className?: string;
};

type DatalistProps = {
  label: string;
  name: string;
  id: string;
  required?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
};

const Datalist: React.FC<DatalistProps> = ({
  label,
  name,
  id,
  required,
  value,
  onChange,
  className,
  options,
  placeholder = "Comienza a escribir...",
  disabled = false,
  error,
  loading,
}) => {
  const [displayValue, setDisplayValue] = useState<string | number>("");

  useEffect(() => {
    // Set the displayed label based on the current value
    const matchedOption = options.find((option) => option.value === value);
    if (matchedOption) {
      setDisplayValue(matchedOption.label);
    }
  }, [value, options]);

  // Manejar el cambio de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue); // Mostrar el label en el input

    const matchedOption = options.find((option) => option.label === inputValue);
    if (matchedOption && onChange) {
      onChange({
        target: { name, value: matchedOption.value },
      } as React.ChangeEvent<HTMLInputElement>);
    } else if (onChange) {
      onChange({
        target: { name, value: inputValue },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="custom-datalist-group">
      <input
        required={required}
        name={name}
        placeholder={placeholder}
        className={`datalist ${className ? className : ""}`}
        id={id}
        value={displayValue} // Muestra el label (displayValue) en lugar del value real
        onChange={handleInputChange}
        disabled={disabled}
        list={`${id}-list`}
      />
      {loading && (
        <div className="datalist-loading">
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
      <label htmlFor={id} className="datalist-label">
        {label}
      </label>
      <datalist id={`${id}-list`}>
        {options.map((option, idx) => (
          <option
            className={`capitalize ${option.className}`}
            key={`${option.value}-${idx}`}
            value={option.label} // Label como valor visible
            data-value={option.value} // Valor real en data-value
            disabled={option.optionDisabled}
          />
        ))}
      </datalist>
    </div>
  );
};

export default Datalist;
