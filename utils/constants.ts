import { LuMonitor, LuUsers } from "react-icons/lu";
import { SquarePlus, LayoutDashboard, Shield } from "lucide-react";
import { GrSubtractCircle, GrDocumentUser, GrMoney } from "react-icons/gr";
import { GiPayMoney } from "react-icons/gi";
import { VscRequestChanges } from "react-icons/vsc";
import { HandHelping } from "lucide-react";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface NavLink {
  category: string;
  requiredPermissions?: string[];
  links: {
    label: string;
    url: string;
    icon: React.ElementType;
    requiredPermissions?: string[];
  }[];
}

export const sidenavLinks: NavLink[] = [
  {
    category: "Administración General",
    requiredPermissions: ["manage_users"],
    links: [
      {
        label: "Monitoreo",
        url: "/monitoreo",
        icon: LuMonitor,
        requiredPermissions: ["manage_users", "view_users"],
      },
      {
        label: "Usuarios",
        url: "/usuarios",
        icon: LuUsers,
        requiredPermissions: ["manage_users", "view_users"],
      },
      // {
      //   label: "Roles",
      //   url: "/roles",
      //   icon: Shield,
      //   requiredPermissions: ["manage_users", "view_users"],
      // },
    ],
  },
  {
    category: "Ingresos",
    requiredPermissions: ["register_income"],
    links: [
      {
        label: "Nuevo Registro",
        url: "/registrar-ingreso",
        icon: SquarePlus,
        requiredPermissions: ["register_income"],
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
        requiredPermissions: ["view_discounts", "manage_discounts"],
      },
      {
        label: "Gastos",
        url: "/registros/gastos",
        icon: GiPayMoney,
        requiredPermissions: ["view_expenses", "manage_expenses"],
      },
      {
        label: "Reposiciones",
        url: "/registros/reposiciones",
        icon: GrMoney,
        requiredPermissions: ["view_expenses", "manage_expenses"],
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
        requiredPermissions: ["view_requests", "manage_requests"],
      },
      {
        label: "Reportes Personales",
        url: "/gestion/reportes-personales",
        icon: GrDocumentUser,
        requiredPermissions: ["view_reports", "manage_reports"],
      },
    ],
  },
  {
    category: "Ingresos Especiales",
    requiredPermissions: ["manage_special_income"],
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
    requiredPermissions: ["view_budget", "manage_budget"],
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
    requiredPermissions: ["manage_provisions"],
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
    requiredPermissions: ["manage_support"],
    links: [
      {
        label: "Tickets",
        url: "/support",
        icon: HandHelping,
      },
    ],
  },
];
