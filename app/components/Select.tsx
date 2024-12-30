import "./select.component.css";
import React, { useState } from "react";

type Option = {
  value: string;
  label: string;
};

interface SelectProps {
  name: string;
  id: string;
  label: string;
  options: Option[];
  value: Option["value"];
}

const Select: React.FC<SelectProps> = ({ options, name, id, label }) => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
  };

  return (
    <div className="select-container">
      <select
        name={name}
        id={id}
        value={selectedValue}
        onChange={handleChange}
        className="select-field"
      >
        <option value="" disabled hidden>
          {label}
        </option>
        {options.map((option: Option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor={id} className="select-label">
        {label}
      </label>
      <span className="select-highlight"></span>
    </div>
  );
};

export default Select;
