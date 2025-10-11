export interface Categoria {
  id: number;
  nombre: string;
  color: string;
  descripcion?: string;
  fechaCreacion?: string;
  usuarioId?: number;
}

// Opcional: Enum para colores predefinidos
export enum ColorCategoria {
  ROJO = '#ff4444',
  AZUL = '#4444ff',
  VERDE = '#44ff44',
  AMARILLO = '#ffff44',
  NARANJA = '#ff8844',
  PURPURA = '#8844ff',
  ROSADO = '#ff44ff',
  CYAN = '#44ffff',
  GRIS = '#888888'
}

// Opcional: Enum para tipos de categoría
export enum TipoCategoria {
  PERSONAL = 'PERSONAL',
  TRABAJO = 'TRABAJO',
  ESTUDIO = 'ESTUDIO',
  HOGAR = 'HOGAR',
  SALUD = 'SALUD',
  FINANZAS = 'FINANZAS',
  OTROS = 'OTROS'
}