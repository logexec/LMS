"use client";
import Link from "next/link";
import React from "react";
import { sidenavLinks } from "@/utils/constants";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const Sidenav = () => {
  const path = usePathname();
  const notification = 8;

  const { hasPermission } = useAuth();

  // Filtrar categorías y links basados en permisos
  const filteredNavLinks = sidenavLinks.filter((category) => {
    // Si la categoría no requiere permisos, mostrarla
    if (!category.requiredPermissions) return true;

    // Si la categoría requiere permisos, verificar
    if (!hasPermission(category.requiredPermissions)) return false;

    // Filtrar los links dentro de la categoría
    const filteredLinks = category.links.filter((link) => {
      if (!link.requiredPermissions) return true;
      return hasPermission(link.requiredPermissions);
    });

    // Solo mostrar la categoría si tiene links visibles
    return filteredLinks.length > 0;

    // Asignar los links filtrados a la categoría
    category.links = filteredLinks;
    return true;
  });

  return (
    <aside className="fixed top-0 bottom-0 left-0 flex flex-col gap-4 h-full w-64 z-20 p-4 bg-slate-950 bg-opacity-90 text-slate-50">
      <Link href="/" className="flex items-center justify-center gap-2">
        <Image
          aria-hidden
          src="/images/logex_logo.png"
          alt="LogeX logo"
          width={128}
          height={100}
          priority
        />
      </Link>
      {filteredNavLinks.map((item) => (
        <div className="flex flex-col" key={item.category}>
          <h3 className="text-slate-400 font-semibold text-sm">
            {item.category}
          </h3>
          <div className="rule-gradient mb-0.5" />
          <ul className="pl-2 text-sm">
            {item.links.map((itemLink) => (
              <li
                key={itemLink.label}
                className={`rounded-lg p-2 hover:bg-primary transition-all duration-300 ease-in-out ${
                  path === itemLink.url ? "bg-red-700 hover:bg-primary" : ""
                }`}
              >
                <Link
                  href={itemLink.url}
                  className="block w-full transition-colors duration-200"
                >
                  <span className="flex items-center justify-between">
                    <div className="flex flex-row gap-2">
                      <itemLink.icon className="size-[1.15rem]" />
                      <span className="transition-colors duration-200">
                        {itemLink.label}
                      </span>
                    </div>
                    {itemLink.url === "/gestion/solicitudes" &&
                      notification > 0 && (
                        <span
                          className={`rounded-full py-0.5 px-2 bg-slate-600 font-medium transition-colors duration-200 ${
                            path === itemLink.url
                              ? "bg-red-700 hover:bg-primary"
                              : "group-hover:bg-red-700"
                          }`}
                        >
                          {notification}
                        </span>
                      )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
};

export default Sidenav;
