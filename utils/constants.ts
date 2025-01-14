import { ElementType } from "react";
import { MdOutlineDashboard } from "react-icons/md";
import { GrDocumentUser, GrSubtractCircle } from "react-icons/gr";
import { VscRequestChanges } from "react-icons/vsc";
import { CgAddR } from "react-icons/cg";
import { GiPayMoney } from "react-icons/gi";
import { LuUsers } from "react-icons/lu";

type NavLink = {
  category: string;
  requiredPermissions?: string[]; // Permisos requeridos para ver toda la categoría
  links: Link[];
};

type Link = {
  label: string;
  url: string;
  icon: ElementType;
  requiredPermissions?: string[]; // Permisos requeridos para ver este link específico
};

export const sidenavLinks: NavLink[] = [
  {
    category: "Administración General",
    requiredPermissions: ["admin"],
    links: [
      {
        label: "Gestionar Usuarios",
        url: "/usuarios",
        icon: LuUsers,
      },
    ],
  },
  {
    category: "Ingresos",
    requiredPermissions: ["admin", "revisar"],
    links: [
      {
        label: "Registrar Nuevo",
        url: "/registrar-ingreso",
        icon: CgAddR,
        requiredPermissions: ["admin"], // Solo admin puede registrar
      },
    ],
  },
  {
    category: "Registros",
    links: [
      {
        label: "Descuentos",
        url: "/registros/descuentos",
        icon: GrSubtractCircle,
        requiredPermissions: ["admin", "revisar"],
      },
      {
        label: "Gastos",
        url: "/registros/gastos",
        icon: GiPayMoney,
        requiredPermissions: ["admin", "revisar"],
      },
    ],
  },
  {
    category: "Gestión",
    links: [
      {
        label: "Solicitudes",
        url: "/gestion/solicitudes",
        icon: VscRequestChanges,
        requiredPermissions: ["admin", "revisar", "pagar"],
      },
      {
        label: "Reportes Personales",
        url: "/gestion/reportes-personales",
        icon: GrDocumentUser,
        requiredPermissions: ["admin", "revisar"],
      },
    ],
  },
  {
    category: "Ingresos Especiales",
    requiredPermissions: ["admin"],
    links: [
      {
        label: "Inicio",
        url: "/ingresos-especiales",
        icon: MdOutlineDashboard,
      },
    ],
  },
  {
    category: "Presupuesto",
    requiredPermissions: ["admin"],
    links: [
      {
        label: "Inicio",
        url: "/presupuesto",
        icon: MdOutlineDashboard,
      },
    ],
  },
  {
    category: "Provisiones",
    requiredPermissions: ["admin"],
    links: [
      {
        label: "Inicio",
        url: "/provisiones",
        icon: MdOutlineDashboard,
      },
    ],
  },
];
