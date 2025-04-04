import { LuUsers } from "react-icons/lu";
import {
  SquarePlus,
  Landmark,
  Wallet,
  PiggyBank,
  Receipt,
  Banknote,
} from "lucide-react";
import { GrSubtractCircle, GrMoney } from "react-icons/gr";
import { GiPayMoney } from "react-icons/gi";
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
    hidden?: boolean;
  }[];
  hidden?: boolean;
}

export const sidenavLinks: NavLink[] = [
  {
    category: "Administración General",
    requiredPermissions: ["manage_users"],
    links: [
      {
        label: "Usuarios",
        url: "/usuarios",
        icon: LuUsers,
        requiredPermissions: ["manage_users", "view_users"],
      },
      {
        label: "Cuentas",
        url: "/cuentas",
        icon: PiggyBank,
        requiredPermissions: ["manage_users", "view_users"],
      },
      {
        label: "Órdenes de Compra",
        url: "/ordenes-compra",
        icon: Receipt,
        requiredPermissions: ["manage_users", "view_users"],
      },
    ],
  },
  {
    category: "Registros",
    links: [
      {
        label: "Nuevo Registro",
        url: "/registros/nuevo",
        icon: SquarePlus,
        requiredPermissions: ["register_income"],
      },
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
        label: "Ingresos",
        url: "/registros/ingresos",
        icon: Banknote,
        requiredPermissions: ["view_expenses", "manage_expenses"],
      },
      {
        label: "Reposiciones",
        url: "/registros/reposiciones",
        icon: GrMoney,
        requiredPermissions: [
          "view_expenses",
          "manage_expenses",
          "view_requests",
          "manage_requests",
        ],
      },
    ],
  },
  // {
  //   category: "Gestión",
  //   links: [
  //     {
  //       label: "Solicitudes",
  //       url: "/gestion/solicitudes",
  //       icon: VscRequestChanges,
  //       requiredPermissions: ["view_requests", "manage_requests"],
  //     },
  //     {
  //       label: "Reportes Personales",
  //       url: "/gestion/reportes-personales",
  //       icon: GrDocumentUser,
  //       requiredPermissions: ["view_reports", "manage_reports"],
  //     },
  //   ],
  // },
  // {
  //   category: "Ingresos Especiales",
  //   requiredPermissions: ["manage_special_income"],
  //   links: [
  //     {
  //       label: "Inicio",
  //       url: "/ingresos-especiales",
  //       icon: LayoutDashboard,
  //     },
  //   ],
  // },
  {
    category: "Finanzas",
    requiredPermissions: ["manage_provisions"],
    links: [
      {
        label: "Presupuesto",
        url: "/finanzas/presupuesto",
        icon: Landmark,
        requiredPermissions: ["view_budget", "manage_budget"],
      },
      {
        label: "Provisiones",
        url: "/finanzas/provisiones",
        icon: Wallet,
        requiredPermissions: ["manage_provisions"],
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
    hidden: true,
  },
];
