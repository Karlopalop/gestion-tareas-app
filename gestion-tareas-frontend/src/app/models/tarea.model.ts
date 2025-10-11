export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  completada: boolean;
  fechaCreacion: string;
  fechaVencimiento: string;
  prioridad: Prioridad;
  usuarioId: number;
  categoriaId?: number;
  categoriaNombre?: string;
}

export enum Prioridad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA'
}

