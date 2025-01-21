import React from "react";
import { ChevronDown } from "lucide-react";
import "./select.component.css";

type Option = {
  value: string | number;
  label: string;
};

type SelectProps = {
  label: string;
  name: string;
  id: string;
  required?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  options: Option[];
  defaultOption?: string;
  disabled?: boolean;
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
  defaultOption = "Selecciona una opción",
  disabled = false,
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
      >
        <option value="" hidden>
          {defaultOption}
        </option>
        {options.map((option, idx) => (
          <option key={`${option.value}-${idx}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor={id} className="select-label">
        {label}
      </label>
      <ChevronDown className="select-icon" size={20} />
    </div>
  );
};

export default Select;
