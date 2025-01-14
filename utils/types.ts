// types.ts
export type PrimitiveType = string | number | boolean | string[];

export interface BasePersonal {
  correo_electronico: string;
  permisos: string[];
}

// Interfaz para el formulario
export interface PersonalForm extends BasePersonal {
  [key: string]: PrimitiveType;
}

// Interfaz para la tabla
export interface PersonalTable extends BasePersonal {
  id: string | number;
  nombres: string;
  usuario: string;
  [key: string]: PrimitiveType;
}
