import React from "react";
import { ChevronDown } from "lucide-react";
import "./datalist.component.css";

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
}) => {
  return (
    <div className="custom-datalist-group">
      <input
        required={required}
        name={name}
        placeholder={placeholder}
        className={`datalist ${className ? className : ""}`}
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        list={`${id}-list`}
      />
      <label htmlFor={id} className="datalist-label">
        {label}
      </label>
      <datalist id={`${id}-list`}>
        {options.map((option, idx) => (
          <option
            className={`capitalize ${option.className}`}
            key={`${option.value}-${idx}`}
            value={option.label}
            disabled={option.optionDisabled}
          ></option>
        ))}
      </datalist>
    </div>
  );
};

export default Datalist;
