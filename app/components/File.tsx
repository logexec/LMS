import React from "react";
interface FileProps {
  accept?: string;
  label: string;
  name: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const File: React.FC<FileProps> = ({ accept, label, name, onChange }) => {
  return (
    <>
      <label className="block text-slate-700 text-sm font-bold">{label}</label>
      <input
        className="flex w-full rounded-md border border-red-300 border-input bg-white text-base text-gray-400 file:border-0 file:bg-red-600 file:text-white file:text-base file:font-medium file:text-center file:px-2 file:py-1"
        type="file"
        id={name}
        name={name}
        accept={accept}
        onChange={onChange}
      />
    </>
  );
};

export default File;
