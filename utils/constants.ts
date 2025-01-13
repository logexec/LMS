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
        label: "Gestionar Personal",
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

// Descuentos Masivos
export const areas = [
  {
    label: "Admin",
    value: "admin",
  },
  {
    label: "Bodega",
    value: "bodega",
  },
  {
    label: "Grifería",
    value: "griferia",
  },
  {
    label: "Monitoreo",
    value: "monitoreo",
  },
  {
    label: "Porteo",
    value: "porteo",
  },
  {
    label: "Proveedor",
    value: "proveedor",
  },
  {
    label: "Sanitarios",
    value: "sanitarios",
  },
  {
    label: "Temporal",
    value: "temporal",
  },
  {
    label: "Transporte",
    value: "transporte",
  },
];

export const proyectos = [
  {
    label: "ADMN",
    value: "admn",
  },
  {
    label: "CNQT",
    value: "cnqt",
  },
];

export const cuentasMasivas = [
  {
    label: "RECUPERACION VALORES COMISION DE REPARTO - 4.2.1.01.10",
    value: "4.2.1.01.10",
  },
  {
    label: "FALTANTES POR COBRAR EMPLEADOS Y TRANSPORTISTAS - 5.1.1.02.22",
    value: "5.1.1.02.22",
  },
];
