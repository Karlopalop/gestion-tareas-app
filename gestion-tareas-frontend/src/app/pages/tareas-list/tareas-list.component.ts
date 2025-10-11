import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TareaService } from '../../services/tarea.service';
import { Tarea, Prioridad } from '../../models/tarea.model';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-tareas-list',
  templateUrl: './tareas-list.component.html',
  styleUrls: ['./tareas-list.component.css']
})
export class TareasListComponent implements OnInit {
  // Variables de paginación
  tareas: Tarea[] = []; // ✅ Esto debe ser siempre un array
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  
  categorias: Categoria[] = [];
  tareaForm: FormGroup;
  showForm: boolean = false;
  isEditing: boolean = false;
  editingTareaId: number | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  // Filtros
  filtroEstado: string = 'todas';
  filtroCategoria: string = 'todas';
  filtroPrioridad: string = 'todas';
  searchText: string = '';

  // Prioridades para el select
  prioridades = Object.values(Prioridad);

  // ✅ NECESARIO para usar Math en el template
  get Math() {
    return Math;
  }

  constructor(
    private tareaService: TareaService,
    private fb: FormBuilder
  ) {
    this.tareaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      prioridad: [Prioridad.MEDIA, Validators.required],
      fechaVencimiento: [''],
      categoriaId: ['']
    });
  }

  ngOnInit(): void {
    this.cargarTareas();
    this.cargarCategorias();
  }

  // ✅ CORREGIDO: Manejar correctamente la respuesta paginada
  cargarTareas(page: number = 0): void {
    this.isLoading = true;
    const usuarioId = 1;

    this.tareaService.obtenerTareasPorUsuario(usuarioId, page, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('📦 Respuesta del backend:', response);
        
        // ✅ CORREGIDO: Extraer el array de tareas de la respuesta paginada
        if (response && response.content) {
          // Respuesta paginada: { content: [], totalElements: X, totalPages: Y }
          this.tareas = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.currentPage = response.number;
        } else if (Array.isArray(response)) {
          // Respuesta simple: array de tareas (fallback)
          this.tareas = response;
          this.totalElements = response.length;
          this.totalPages = 1;
          this.currentPage = page;
        } else {
          // Respuesta inesperada
          console.error('❌ Formato de respuesta inesperado:', response);
          this.tareas = [];
          this.totalElements = 0;
          this.totalPages = 0;
        }
        
        this.isLoading = false;
        console.log('✅ Tareas cargadas:', this.tareas.length);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las tareas';
        this.isLoading = false;
        console.error('❌ Error cargando tareas:', error);
        this.tareas = []; // ✅ Asegurar que sea array vacío en caso de error
      }
    });
  }

  cargarCategorias(): void {
    console.log('🔄 Iniciando carga de categorías...');
    
    this.tareaService.obtenerCategorias().subscribe({
      next: (categorias: any) => {
        console.log('📦 Respuesta categorías:', categorias);
        
        // ✅ CORREGIDO: Manejar también paginación en categorías si existe
        if (categorias && categorias.content) {
          this.categorias = categorias.content;
        } else if (Array.isArray(categorias)) {
          this.categorias = categorias;
        } else {
          console.error('❌ Formato de categorías inesperado:', categorias);
          this.categorias = [];
        }
        
        console.log('✅ Categorías cargadas:', this.categorias.length);
      },
      error: (error) => {
        console.error('❌ Error cargando categorías:', error);
        this.categorias = []; // ✅ Asegurar array vacío
      }
    });
  }

  // ✅ CORREGIDO: Métodos de paginación
  cambiarPagina(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.cargarTareas(page);
    }
  }

  cambiarTamanoPagina(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.cargarTareas(0);
  }

  // ✅ CORREGIDO: Filtrar tareas (maneja descripcion undefined)
  get tareasFiltradas(): Tarea[] {
    const searchTextLower = this.searchText.toLowerCase();
    
    return this.tareas.filter(tarea => {
      // Filtro por estado
      const estadoMatch = this.filtroEstado === 'todas' || 
        (this.filtroEstado === 'completadas' && tarea.completada) ||
        (this.filtroEstado === 'pendientes' && !tarea.completada);

      // Filtro por categoría
      const categoriaMatch = this.filtroCategoria === 'todas' || 
        tarea.categoriaId?.toString() === this.filtroCategoria;

      // Filtro por prioridad
      const prioridadMatch = this.filtroPrioridad === 'todas' || 
        tarea.prioridad === this.filtroPrioridad;

      // ✅ CORREGIDO: Filtro por búsqueda (maneja campos undefined)
      const searchMatch = !this.searchText || 
        tarea.titulo?.toLowerCase().includes(searchTextLower) ||
        tarea.descripcion?.toLowerCase().includes(searchTextLower);

      return estadoMatch && categoriaMatch && prioridadMatch && searchMatch;
    });
  }

  // ✅ CORREGIDO: Obtener números de páginas
  get paginas(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ... el resto de tus métodos permanecen igual
  mostrarFormulario(editarTarea?: Tarea): void {
    this.showForm = true;
    this.isEditing = !!editarTarea;
    
    if (editarTarea) {
      this.editingTareaId = editarTarea.id;
      this.tareaForm.patchValue({
        titulo: editarTarea.titulo,
        descripcion: editarTarea.descripcion,
        prioridad: editarTarea.prioridad,
        fechaVencimiento: editarTarea.fechaVencimiento,
        categoriaId: editarTarea.categoriaId || ''
      });
    } else {
      this.tareaForm.reset({
        prioridad: Prioridad.MEDIA,
        categoriaId: ''
      });
    }
  }

  ocultarFormulario(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingTareaId = null;
    this.tareaForm.reset({
      prioridad: Prioridad.MEDIA,
      categoriaId: ''
    });
  }

  onSubmit(): void {
    if (this.tareaForm.valid) {
      const tareaData = {
        ...this.tareaForm.value,
        usuarioId: 1,
        completada: false
      };

      if (this.isEditing && this.editingTareaId) {
        this.tareaService.actualizarTarea(this.editingTareaId, tareaData as Tarea).subscribe({
          next: () => {
            this.cargarTareas(this.currentPage);
            this.ocultarFormulario();
          },
          error: (error) => {
            this.errorMessage = 'Error al actualizar la tarea';
            console.error('Error actualizando tarea:', error);
          }
        });
      } else {
        this.tareaService.crearTarea(tareaData as Tarea).subscribe({
          next: () => {
            this.cargarTareas(0);
            this.ocultarFormulario();
          },
          error: (error) => {
            this.errorMessage = 'Error al crear la tarea';
            console.error('Error creando tarea:', error);
          }
        });
      }
    } else {
      Object.keys(this.tareaForm.controls).forEach(key => {
        this.tareaForm.get(key)?.markAsTouched();
      });
    }
  }

  toggleCompletada(tarea: Tarea): void {
    if (tarea.completada) {
      const tareaActualizada = { ...tarea, completada: false };
      this.tareaService.actualizarTarea(tarea.id, tareaActualizada).subscribe({
        next: () => this.cargarTareas(this.currentPage),
        error: (error) => {
          this.errorMessage = 'Error al actualizar la tarea';
          console.error('Error actualizando tarea:', error);
        }
      });
    } else {
      this.tareaService.marcarComoCompletada(tarea.id).subscribe({
        next: () => this.cargarTareas(this.currentPage),
        error: (error) => {
          this.errorMessage = 'Error al completar la tarea';
          console.error('Error completando tarea:', error);
        }
      });
    }
  }

  eliminarTarea(tareaId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.tareaService.eliminarTarea(tareaId).subscribe({
        next: () => this.cargarTareas(this.currentPage),
        error: (error) => {
          this.errorMessage = 'Error al eliminar la tarea';
          console.error('Error eliminando tarea:', error);
        }
      });
    }
  }

  getNombreCategoria(categoriaId?: number): string {
    if (!categoriaId) return 'Sin categoría';
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  getColorCategoria(categoriaId?: number): string {
    if (!categoriaId) return '#95a5a6';
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.color : '#95a5a6';
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'todas';
    this.filtroCategoria = 'todas';
    this.filtroPrioridad = 'todas';
    this.searchText = '';
    this.cargarTareas(0);
  }
}