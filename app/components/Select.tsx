import React from "react";
import { ChevronDown } from "lucide-react";
import "./select.component.css";

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
    </div>
  );
};

export default Select;
