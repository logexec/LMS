import React from "react";

interface HrProps {
  variant?: "red" | "slate";
}

const Hr: React.FC<HrProps> = ({ variant = "slate" }) => {
  return (
    <div
      className={`h-[1px] w-11/12 bg-linear-to-r ${
        variant === "slate" ? "from-slate-400" : "from-red-400"
      } to-transparent`}
    />
  );
};

export default Hr;
