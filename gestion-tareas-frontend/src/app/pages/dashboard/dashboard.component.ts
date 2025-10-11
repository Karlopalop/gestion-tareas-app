import { Component, OnInit } from '@angular/core';
import { TareaService } from '../../services/tarea.service';
// POR ESTA:
import { Tarea } from '../../models/tarea.model';
import { Categoria } from '../../models/categoria.model';;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Estadísticas
  totalTareas: number = 0;
  tareasPendientes: number = 0;
  tareasCompletadas: number = 0;
  tareasProximas: number = 0;

  // Listas
  tareasRecientes: Tarea[] = [];
  categorias: Categoria[] = [];

  isLoading: boolean = true;
  errorMessage: string = '';

  // Datos para gráficos (simplificado)
  statsData = {
    pendientes: 0,
    completadas: 0
  };

  constructor(private tareaService: TareaService) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.isLoading = true;
    
    // Por ahora usamos usuarioId 1 para pruebas
    const usuarioId = 1;

    // Cargar tareas del usuario
    this.tareaService.obtenerTareasPorUsuario(usuarioId).subscribe({
      next: (tareas: Tarea[]) => {
        this.procesarTareas(tareas);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar el dashboard';
        this.isLoading = false;
        console.error('Dashboard error:', error);
      }
    });

    // Cargar categorías
    this.tareaService.obtenerCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
      }
    });
  }

  private procesarTareas(tareas: Tarea[]): void {
    this.totalTareas = tareas.length;
    this.tareasPendientes = tareas.filter(t => !t.completada).length;
    this.tareasCompletadas = tareas.filter(t => t.completada).length;
    
    // Tareas próximas a vencer (en los próximos 3 días)
    const hoy = new Date();
    const en3Dias = new Date();
    en3Dias.setDate(hoy.getDate() + 3);
    
    this.tareasProximas = tareas.filter(t => {
      if (t.completada || !t.fechaVencimiento) return false;
      const fechaVencimiento = new Date(t.fechaVencimiento);
      return fechaVencimiento <= en3Dias && fechaVencimiento >= hoy;
    }).length;

    // Tareas más recientes (últimas 5)
    this.tareasRecientes = tareas
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 5);

    // Datos para estadísticas
    this.statsData = {
      pendientes: this.tareasPendientes,
      completadas: this.tareasCompletadas
    };
  }

  getPorcentajeCompletadas(): number {
    if (this.totalTareas === 0) return 0;
    return Math.round((this.tareasCompletadas / this.totalTareas) * 100);
  }

  recargar(): void {
    this.cargarDashboard();
  }
}