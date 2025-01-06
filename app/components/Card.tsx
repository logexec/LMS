import Link from "next/link";
import React from "react";

interface CardProps {
  title: string;
  description: string;
  image?: string;
  url: string;
}

const Card: React.FC<CardProps> = ({ title, description, image, url }) => {
  return (
    <Link
      href={url}
      className="flex flex-col items-center justify-center p-5 backdrop-blur bg-primary bg-opacity-75 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-red-600"
    >
      <h1 className="w-full max-w-sm mx-auto overflow-hidden text-white font-bold">
        {title}
      </h1>
      <p className="text-sm font-base text-slate-100">{description}</p>
    </Link>
  );
};

export default Card;
