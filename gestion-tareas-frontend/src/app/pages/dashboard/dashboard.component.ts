import { Component, OnInit } from '@angular/core';
import { TareaService } from '../../services/tarea.service';
import { AuthService } from '../../services/auth.service';
import { Tarea } from '../../models/tarea.model';
import { Categoria } from '../../models/categoria.model';

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
  usuarioLogueado: string = '';

  // Datos para gráficos
  statsData = {
    pendientes: 0,
    completadas: 0
  };

  constructor(
    private tareaService: TareaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarDashboard();
  }

  private verificarAutenticacion(): void {
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Debes iniciar sesión para ver el dashboard';
      this.isLoading = false;
      return;
    }

    const usuario = this.authService.getCurrentUser();
    this.usuarioLogueado = usuario?.username || 'Usuario';
    console.log('👤 Usuario en dashboard:', this.usuarioLogueado);
  }

  private getUsuarioId(): number {
    const usuarioId = this.authService.getCurrentUserId();
    if (!usuarioId) {
      console.error('❌ No se pudo obtener el ID del usuario');
      throw new Error('Usuario no autenticado');
    }
    return usuarioId;
  }

  cargarDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const usuarioId = this.getUsuarioId();
    console.log('🔄 Cargando dashboard para usuario ID:', usuarioId);

    // Cargar tareas primero para ver la estructura real
    this.tareaService.obtenerTareasPorUsuario(usuarioId).subscribe({
      next: (response: any) => {
        console.log('📦 Respuesta del dashboard:', response);
        
        let tareas: Tarea[] = [];
        
        if (Array.isArray(response)) {
          tareas = response;
        } else if (response && Array.isArray(response.content)) {
          tareas = response.content;
        } else {
          console.error('❌ Formato de respuesta inesperado:', response);
          tareas = [];
        }

        console.log('✅ Tareas recibidas en dashboard:', tareas.length);
        
        // ✅ DEBUG CRÍTICO: Ver la estructura REAL de los datos
        if (tareas.length > 0) {
          console.log('🔍 ESTRUCTURA REAL DE LA PRIMERA TAREA:', tareas[0]);
          console.log('📋 PROPIEDADES DISPONIBLES:', Object.keys(tareas[0]));
          console.log('🏷️  CATEGORÍA INFO:', {
            categoriaId: tareas[0].categoriaId,
            categoriaNombre: tareas[0].categoriaNombre,
            categoria: tareas[0].categoria
          });
        }
        
        this.procesarTareas(tareas);
        
        // Ahora cargar categorías para tener información completa
        this.cargarCategorias();
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar el dashboard. Intenta recargar la página.';
        this.isLoading = false;
        console.error('❌ Dashboard error:', error);
      }
    });
  }

  private cargarCategorias(): void {
    this.tareaService.obtenerCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias;
        console.log('✅ Categorías cargadas:', categorias.length);
      },
      error: (error) => {
        console.error('❌ Error cargando categorías:', error);
        this.categorias = [];
      }
    });
  }

  private procesarTareas(tareas: Tarea[]): void {
    console.log('🔄 Procesando tareas para estadísticas...');
    
    const usuarioId = this.getUsuarioId();
    const tareasDelUsuario = tareas.filter(tarea => {
      const perteneceAlUsuario = tarea.usuarioId === usuarioId;
      return perteneceAlUsuario;
    });

    this.totalTareas = tareasDelUsuario.length;
    this.tareasPendientes = tareasDelUsuario.filter(t => !t.completada).length;
    this.tareasCompletadas = tareasDelUsuario.filter(t => t.completada).length;

    // Tareas próximas a vencer
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const en3Dias = new Date();
    en3Dias.setDate(hoy.getDate() + 3);
    en3Dias.setHours(23, 59, 59, 999);
    
    this.tareasProximas = tareasDelUsuario.filter(t => {
      if (t.completada || !t.fechaVencimiento) return false;
      
      try {
        const fechaVencimiento = new Date(t.fechaVencimiento);
        fechaVencimiento.setHours(0, 0, 0, 0);
        
        return fechaVencimiento >= hoy && fechaVencimiento <= en3Dias;
      } catch (error) {
        console.warn('⚠️ Fecha de vencimiento inválida:', t.fechaVencimiento);
        return false;
      }
    }).length;

    // Tareas más recientes (últimas 5)
    this.tareasRecientes = tareasDelUsuario
      .sort((a, b) => {
        try {
          const fechaA = new Date(a.fechaCreacion).getTime();
          const fechaB = new Date(b.fechaCreacion).getTime();
          return fechaB - fechaA;
        } catch (error) {
          console.warn('⚠️ Error ordenando por fecha:', error);
          return 0;
        }
      })
      .slice(0, 5);

    console.log('🆕 Tareas recientes procesadas:', this.tareasRecientes.length);
    
    // ✅ DEBUG: Ver información de categorías en tareas recientes
    this.tareasRecientes.forEach((tarea, index) => {
      console.log(`📝 Tarea Reciente ${index + 1}:`, {
        titulo: tarea.titulo,
        categoriaId: tarea.categoriaId,
        categoriaNombre: tarea.categoriaNombre,
        categoriaEncontrada: this.getNombreCategoria(tarea)
      });
    });
  }

  getPorcentajeCompletadas(): number {
    if (this.totalTareas === 0) return 0;
    const porcentaje = Math.round((this.tareasCompletadas / this.totalTareas) * 100);
    return porcentaje;
  }

  // ✅ CORREGIDO: Método simplificado que usa categoriaNombre del DTO
  getNombreCategoria(tarea: Tarea): string {
    // ✅ PRIMERO: Usar categoriaNombre que viene directamente del DTO
    if (tarea.categoriaNombre) {
      console.log('✅ Usando categoriaNombre del DTO:', tarea.categoriaNombre);
      return tarea.categoriaNombre;
    }
    
    // ✅ SEGUNDO: Si no hay categoriaNombre, buscar por categoriaId en la lista local
    if (tarea.categoriaId && this.categorias.length > 0) {
      const categoria = this.categorias.find(c => c.id === tarea.categoriaId);
      if (categoria) {
        console.log('✅ Categoría encontrada por ID:', categoria.nombre);
        return categoria.nombre;
      }
    }
    
    // ✅ TERCERO: Si viene el objeto categoria completo (por si acaso)
    if (tarea.categoria && tarea.categoria.nombre) {
      console.log('✅ Usando objeto categoria:', tarea.categoria.nombre);
      return tarea.categoria.nombre;
    }
    
    // ✅ CUARTO: Sin categoría
    console.log('❌ No se encontró categoría para la tarea');
    return 'Sin categoría';
  }

  // ✅ CORREGIDO: Método para obtener color de categoría
  getColorCategoria(tarea: Tarea): string {
    // ✅ PRIMERO: Buscar por categoriaId en la lista local (para obtener color)
    if (tarea.categoriaId && this.categorias.length > 0) {
      const categoria = this.categorias.find(c => c.id === tarea.categoriaId);
      if (categoria && categoria.color) {
        return categoria.color;
      }
    }
    
    // ✅ SEGUNDO: Si viene el objeto categoria completo
    if (tarea.categoria && tarea.categoria.color) {
      return tarea.categoria.color;
    }
    
    // ✅ TERCERO: Color por defecto
    return '#95a5a6';
  }

  get hayTareas(): boolean {
    return this.totalTareas > 0;
  }

  get hayTareasRecientes(): boolean {
    return this.tareasRecientes.length > 0;
  }

  get mensajeBienvenida(): string {
    if (!this.hayTareas) {
      return `¡Bienvenido ${this.usuarioLogueado}! Comienza creando tu primera tarea.`;
    }
    
    const porcentaje = this.getPorcentajeCompletadas();
    if (porcentaje === 100) {
      return `¡Increíble ${this.usuarioLogueado}! Has completado todas tus tareas. 🎉`;
    } else if (porcentaje >= 75) {
      return `¡Excelente trabajo ${this.usuarioLogueado}! Vas muy bien.`;
    } else if (porcentaje >= 50) {
      return `Buen progreso ${this.usuarioLogueado}, sigue así.`;
    } else {
      return `¡Hola ${this.usuarioLogueado}! Gestiona tus tareas de forma eficiente.`;
    }
  }

  recargar(): void {
    console.log('🔄 Recargando dashboard...');
    this.cargarDashboard();
  }
}