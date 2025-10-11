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
  tareas: Tarea[] = [];
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

  cargarTareas(): void {
    this.isLoading = true;
    // Por ahora usamos usuarioId 1 para pruebas
    const usuarioId = 1;

    this.tareaService.obtenerTareasPorUsuario(usuarioId).subscribe({
      next: (tareas: Tarea[]) => {
        this.tareas = tareas;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las tareas';
        this.isLoading = false;
        console.error('Error cargando tareas:', error);
      }
    });
  }

  cargarCategorias(): void {
    this.tareaService.obtenerCategorias().subscribe({
      next: (categorias: Categoria[]) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
      }
    });
  }

  // Filtrar tareas
  get tareasFiltradas(): Tarea[] {
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

      // Filtro por búsqueda de texto
      const searchMatch = !this.searchText || 
        tarea.titulo.toLowerCase().includes(this.searchText.toLowerCase()) ||
        tarea.descripcion.toLowerCase().includes(this.searchText.toLowerCase());

      return estadoMatch && categoriaMatch && prioridadMatch && searchMatch;
    });
  }

  // Formulario
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
        usuarioId: 1, // Por ahora usuario fijo
        completada: false
      };

      if (this.isEditing && this.editingTareaId) {
        // Editar tarea existente
        this.tareaService.actualizarTarea(this.editingTareaId, tareaData as Tarea).subscribe({
          next: () => {
            this.cargarTareas();
            this.ocultarFormulario();
          },
          error: (error) => {
            this.errorMessage = 'Error al actualizar la tarea';
            console.error('Error actualizando tarea:', error);
          }
        });
      } else {
        // Crear nueva tarea
        this.tareaService.crearTarea(tareaData as Tarea).subscribe({
          next: () => {
            this.cargarTareas();
            this.ocultarFormulario();
          },
          error: (error) => {
            this.errorMessage = 'Error al crear la tarea';
            console.error('Error creando tarea:', error);
          }
        });
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.tareaForm.controls).forEach(key => {
        this.tareaForm.get(key)?.markAsTouched();
      });
    }
  }

  // Acciones de tareas
  toggleCompletada(tarea: Tarea): void {
    if (tarea.completada) {
      // Si ya está completada, la marcamos como pendiente
      const tareaActualizada = { ...tarea, completada: false };
      this.tareaService.actualizarTarea(tarea.id, tareaActualizada).subscribe({
        next: () => this.cargarTareas(),
        error: (error) => {
          this.errorMessage = 'Error al actualizar la tarea';
          console.error('Error actualizando tarea:', error);
        }
      });
    } else {
      // Si está pendiente, la marcamos como completada
      this.tareaService.marcarComoCompletada(tarea.id).subscribe({
        next: () => this.cargarTareas(),
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
        next: () => this.cargarTareas(),
        error: (error) => {
          this.errorMessage = 'Error al eliminar la tarea';
          console.error('Error eliminando tarea:', error);
        }
      });
    }
  }

  // Helpers
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
  }
}