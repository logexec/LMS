import React from "react";
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
}) => {
  return (
    <div className="custom-input-group">
      <input
        required={required}
        type={type}
        name={name}
        className={`input ${className ? className : ""}`}
        id={id}
        value={
          value ||
          (currentDate ? new Date().toISOString().split("T")[0] : value)
        }
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        step={step}
      />
      <label htmlFor={id} className="user-label">
        {label}
      </label>
    </div>
  );
};

export default Input;
