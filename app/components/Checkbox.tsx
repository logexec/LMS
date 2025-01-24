import "./checkbox.component.css";
import React from "react";

interface CheckboxProps {
  label: string;
  name: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  hideLabel?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  id = name,
  value,
  onChange,
  checked,
  disabled = false,
  className = "",
  labelClassName = "",
  hideLabel = false,
}) => {
  return (
    <div className={`checkbox-wrapper ${className}`}>
      <input
        type="checkbox"
        id={id}
        className="inp-cbx"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={hideLabel ? label : undefined}
      />
      <label
        htmlFor={id}
        className={`cbx capitalize ${labelClassName} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span>
          <svg viewBox="0 0 12 10" height="10px" width="12px">
            <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
          </svg>
        </span>
        {!hideLabel && <span>{label}</span>}
      </label>
    </div>
  );
};

export default Checkbox;
