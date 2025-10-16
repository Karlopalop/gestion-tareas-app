// tarea.model.ts
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
  categoriaId?: number;        
  categoria?: Categoria;
  
  // ✅ AÑADIR: Campos que vienen del DTO del backend
  categoriaNombre?: string;    // Este viene del TareaDTO del backend
}

export enum Prioridad {
  ALTA = 'ALTA',
  MEDIA = 'MEDIA', 
  BAJA = 'BAJA'
}