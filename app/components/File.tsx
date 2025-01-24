import React from "react";
interface FileProps {
  accept?: string;
  label: string;
  name: string;
  variant?: "green" | "red";
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  required?: boolean;
}

const File: React.FC<FileProps> = ({
  accept,
  label,
  name,
  variant = "red",
  onChange,
  disabled,
  className,
  labelClassName,
  required,
}) => {
  return (
    <>
      <label
        className={`block text-slate-700 text-sm font-bold ${labelClassName}`}
      >
        {label}
      </label>
      <input
        className={`flex w-full rounded-md border cursor-pointer border-input bg-white text-base text-gray-500 font-semibold file:border-0 file:text-white file:text-base file:font-medium file:text-center file:px-2 file:py-1 disabled:opacity-50 disabled:cursor-not-allowed ${
          variant === "green"
            ? "file:bg-emerald-600 border-emerald-300"
            : "file:bg-red-600 border-red-300"
        } ${className}`}
        type="file"
        id={name}
        name={name}
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        required={required}
      />
    </>
  );
};

export default File;
