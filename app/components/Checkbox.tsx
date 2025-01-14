import "./checkbox.component.css";
import React from "react";

type InputProps = {
  label: string;
  name: string;
  id: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
};

const Checkbox: React.FC<InputProps> = ({
  label,
  name,
  id,
  value,
  onChange,
  checked,
}) => {
  return (
    <div className="checkbox-wrapper">
      <input
        type="checkbox"
        id={id}
        className="inp-cbx"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={id} className="cbx">
        <span>
          <svg viewBox="0 0 12 10" height="10px" width="12px">
            <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
          </svg>
        </span>
        <span>{label}</span>
      </label>
    </div>
  );
};

export default Checkbox;
