import { ElementType } from "react";
import { GrDocumentUser, GrSubtractCircle } from "react-icons/gr";
import { VscRequestChanges } from "react-icons/vsc";
import { GiPayMoney } from "react-icons/gi";
import { LuUsers } from "react-icons/lu";
import {
  HandHelping,
  LayoutDashboard,
  SquarePlus,
  Truck,
  User2,
} from "lucide-react";

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
        label: "Usuarios",
        url: "/usuarios",
        icon: LuUsers,
      },
      // {
      //   label: "Empleados",
      //   url: "/employees",
      //   icon: User2,
      // },
      // {
      //   label: "Transporte",
      //   url: "/usuarios",
      //   icon: Truck,
      // },
    ],
  },
  {
    category: "Ingresos",
    requiredPermissions: ["admin", "revisar"],
    links: [
      {
        label: "Nuevo Registro",
        url: "/registrar-ingreso",
        icon: SquarePlus,
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
        requiredPermissions: ["admin", "revisar", "user"],
      },
      {
        label: "Gastos",
        url: "/registros/gastos",
        icon: GiPayMoney,
        requiredPermissions: ["admin", "revisar", "user"],
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
        requiredPermissions: ["admin", "revisar", "pagar", "user"],
      },
      {
        label: "Reportes Personales",
        url: "/gestion/reportes-personales",
        icon: GrDocumentUser,
        requiredPermissions: ["admin", "revisar", "user"],
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
        icon: LayoutDashboard,
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
        icon: LayoutDashboard,
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
        icon: LayoutDashboard,
      },
    ],
  },
  {
    category: "Soporte",
    requiredPermissions: ["user", "admin", "developer"],
    links: [
      {
        label: "Tickets",
        url: "/support",
        icon: HandHelping,
      },
    ],
  },
];
