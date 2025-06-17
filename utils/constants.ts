import { LuUsers } from "react-icons/lu";
import {
  SquarePlus,
  Landmark,
  Wallet,
  PiggyBank,
  // Receipt,
  Banknote,
  HandHelping,
  CircleDollarSign,
  ReceiptText,
} from "lucide-react";
import { GrSubtractCircle, GrMoney } from "react-icons/gr";
import { GiPayMoney } from "react-icons/gi";
import { RiReceiptLine } from "react-icons/ri";

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

export enum Permission {
  VIEW_USERS = "view_users",
  MANAGE_USERS = "manage_users",
  VIEW_INCOME = "view_income",
  EDIT_INCOME = "edit_income",
  MANAGE_INCOME = "manage_income",
  VIEW_DISCOUNTS = "view_discounts",
  MANAGE_DISCOUNTS = "manage_discounts",
  VIEW_EXPENSES = "view_expenses",
  MANAGE_EXPENSES = "manage_expenses",
  VIEW_REQUESTS = "view_requests",
  MANAGE_REQUESTS = "manage_requests",
  VIEW_REPOSITIONS = "view_repositions",
  EDIT_REPOSITIONS = "edit_repositions",
  MANAGE_REPOSITIONS = "manage_repositions",
  VIEW_BUDGET = "view_budget",
  MANAGE_BUDGET = "manage_budget",
  VIEW_PROVISIONS = "view_provisions",
  MANAGE_PROVISIONS = "manage_provisions",
  MANAGE_SPECIAL_INCOME = "manage_special_income",
  MANAGE_SUPPORT = "manage_support",
}

export const sidenavLinks: NavLink[] = [
  {
    category: "Administración General",
    requiredPermissions: [Permission.MANAGE_USERS],
    links: [
      {
        label: "Usuarios",
        url: "/usuarios",
        icon: LuUsers,
        requiredPermissions: [Permission.VIEW_USERS],
      },
      {
        label: "Cuentas",
        url: "/cuentas",
        icon: PiggyBank,
        requiredPermissions: [Permission.VIEW_USERS],
      },
    ],
  },
  {
    category: "Facturación",
    requiredPermissions: [Permission.MANAGE_BUDGET],
    links: [
      // {
      //   label: "Facturación",
      //   url: "/facturacion/facturacion",
      //   icon: RiReceiptLine,
      // },
      // {
      //   label: "SRI",
      //   url: "/facturacion/sri",
      //   icon: ReceiptText,
      // },
      // {
      //   label: "Órdenes de Compra",
      //   url: "/facturacion/ordenes-compra",
      //   icon: Receipt,
      // },
      {
        label: "Importar XML",
        url: "/facturas/importar",
        icon: RiReceiptLine,
      },
      {
        label: "Facturas",
        url: "/facturas",
        icon: ReceiptText,
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
        requiredPermissions: [Permission.VIEW_EXPENSES],
      },
      {
        label: "Descuentos",
        url: "/registros/discounts",
        icon: GrSubtractCircle,
        requiredPermissions: [Permission.VIEW_DISCOUNTS],
      },
      {
        label: "Gastos",
        url: "/registros/expenses",
        icon: GiPayMoney,
        requiredPermissions: [Permission.VIEW_EXPENSES],
      },
      {
        label: "Ingresos",
        url: "/registros/income",
        icon: Banknote,
        requiredPermissions: [Permission.EDIT_INCOME],
      },
      {
        label: "Reposiciones",
        url: "/registros/repositions",
        icon: GrMoney,
        requiredPermissions: [Permission.VIEW_EXPENSES],
      },
      {
        label: "Reposiciones de Ingresos",
        url: "/registros/income-repositions",
        icon: CircleDollarSign,
        requiredPermissions: [Permission.EDIT_INCOME],
      },
    ],
  },
  {
    category: "Finanzas",
    requiredPermissions: [Permission.MANAGE_BUDGET],
    links: [
      {
        label: "Presupuesto",
        url: "/finanzas/presupuesto",
        icon: Landmark,
        requiredPermissions: [Permission.VIEW_BUDGET],
      },
      {
        label: "Provisiones",
        url: "/finanzas/provisiones",
        icon: Wallet,
        requiredPermissions: [Permission.VIEW_PROVISIONS],
      },
    ],
  },
  {
    category: "Soporte",
    requiredPermissions: [Permission.MANAGE_SUPPORT],
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
