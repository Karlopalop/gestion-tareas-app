import { Categoria } from './categoria.model';

export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  completada: boolean;
  fechaCreacion: string;
  fechaVencimiento?: string;
  prioridad: Prioridad;
  usuarioId: number;
  categoriaId?: number;        // Solo el ID de la categoría
  categoria?: Categoria;       // Objeto categoria completo (opcional)
}

export enum Prioridad {
  ALTA = 'ALTA',
  MEDIA = 'MEDIA', 
  BAJA = 'BAJA'
}