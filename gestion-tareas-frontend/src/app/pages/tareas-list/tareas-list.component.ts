import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TareaService } from '../../services/tarea.service';
import { AuthService } from '../../services/auth.service';
import { Tarea, Prioridad } from '../../models/tarea.model';
import { Categoria } from '../../models/categoria.model';

@Component({
  selector: 'app-tareas-list',
  templateUrl: './tareas-list.component.html',
  styleUrls: ['./tareas-list.component.css']
})
export class TareasListComponent implements OnInit {
  // Variables de paginación
  tareas: Tarea[] = [];
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
  successMessage: string = '';

  // Filtros
  filtroEstado: string = 'todas';
  filtroCategoria: string = 'todas';
  filtroPrioridad: string = 'todas';
  searchText: string = '';

  // Prioridades para el select
  prioridades = Object.values(Prioridad);

  get Math() {
    return Math;
  }

  constructor(
    private tareaService: TareaService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.tareaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      prioridad: [Prioridad.MEDIA, Validators.required],
      fechaVencimiento: [''],
      categoriaId: ['']  // Seguimos usando categoriaId en el formulario
    });
  }

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarTareas();
    this.cargarCategorias();
  }

  private verificarAutenticacion(): void {
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Debes iniciar sesión para ver tus tareas';
    } else {
      console.log('✅ Usuario autenticado:', this.authService.getCurrentUsername());
    }
  }

  private getUsuarioId(): number {
    const usuarioId = this.authService.getCurrentUserId();
    if (!usuarioId) {
      console.warn('⚠️ No hay usuario logueado, usando ID por defecto 1');
      return 1;
    }
    return usuarioId;
  }

  cargarTareas(page: number = 0): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tareaService.obtenerTareas(page, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('📦 Respuesta del backend:', response);
        
        if (response && response.content) {
          this.tareas = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.currentPage = response.number;
        } else if (Array.isArray(response)) {
          this.tareas = response;
          this.totalElements = response.length;
          this.totalPages = 1;
          this.currentPage = page;
        } else {
          console.error('❌ Formato de respuesta inesperado:', response);
          this.tareas = [];
          this.totalElements = 0;
          this.totalPages = 0;
        }
        
        this.isLoading = false;
        console.log('✅ Tareas cargadas:', this.tareas.length);
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las tareas. Verifica tu conexión.';
        this.isLoading = false;
        console.error('❌ Error cargando tareas:', error);
        this.tareas = [];
      }
    });
  }

  cargarCategorias(): void {
    console.log('🔄 Iniciando carga de categorías...');
    
    this.tareaService.obtenerCategorias().subscribe({
      next: (categorias: any) => {
        console.log('📦 Respuesta categorías:', categorias);
        
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
        this.categorias = [];
      }
    });
  }

  // ✅ CORREGIDO: Método onSubmit que envía la categoría correctamente al backend
  onSubmit(): void {
    if (this.tareaForm.valid) {
      const usuarioId = this.getUsuarioId();
      const formValue = this.tareaForm.value;
      
      // ✅ CORREGIDO: Preparar datos para el backend
      const tareaData: any = {
        titulo: formValue.titulo,
        descripcion: formValue.descripcion,
        prioridad: formValue.prioridad,
        fechaVencimiento: formValue.fechaVencimiento,
        usuarioId: usuarioId,
        completada: false
      };

      // ✅ CORREGIDO: Si hay categoría seleccionada, enviar como objeto
      if (formValue.categoriaId) {
        tareaData.categoria = { id: formValue.categoriaId };
        console.log('✅ Enviando categoría:', tareaData.categoria);
      } else {
        tareaData.categoria = null;
        console.log('ℹ️ Sin categoría seleccionada');
      }

      console.log('📤 Enviando tarea al backend:', tareaData);

      if (this.isEditing && this.editingTareaId) {
        this.tareaService.actualizarTarea(this.editingTareaId, tareaData).subscribe({
          next: () => {
            this.successMessage = 'Tarea actualizada correctamente';
            this.cargarTareas(this.currentPage);
            this.ocultarFormulario();
            this.ocultarMensajeExito();
          },
          error: (error) => {
            this.errorMessage = 'Error al actualizar la tarea';
            console.error('❌ Error actualizando tarea:', error);
          }
        });
      } else {
        this.tareaService.crearTarea(tareaData).subscribe({
          next: () => {
            this.successMessage = 'Tarea creada correctamente';
            this.cargarTareas(0);
            this.ocultarFormulario();
            this.ocultarMensajeExito();
          },
          error: (error) => {
            this.errorMessage = 'Error al crear la tarea';
            console.error('❌ Error creando tarea:', error);
            
            // Mostrar más detalles del error
            if (error.error) {
              console.error('🔍 Detalles del error:', error.error);
            }
          }
        });
      }
    } else {
      Object.keys(this.tareaForm.controls).forEach(key => {
        this.tareaForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Por favor, completa todos los campos requeridos';
    }
  }

  // ✅ CORREGIDO: Al editar, cargar la categoría correctamente
  mostrarFormulario(editarTarea?: Tarea): void {
    this.showForm = true;
    this.isEditing = !!editarTarea;
    this.errorMessage = '';
    
    if (editarTarea) {
      this.editingTareaId = editarTarea.id;
      
      // ✅ CORREGIDO: Obtener categoriaId del objeto tarea
      const categoriaId = editarTarea.categoriaId || 
                         (editarTarea.categoria ? editarTarea.categoria.id : null);
      
      console.log('📝 Editando tarea:', {
        tarea: editarTarea,
        categoriaId: categoriaId
      });
      
      this.tareaForm.patchValue({
        titulo: editarTarea.titulo,
        descripcion: editarTarea.descripcion,
        prioridad: editarTarea.prioridad,
        fechaVencimiento: editarTarea.fechaVencimiento,
        categoriaId: categoriaId || ''
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
    this.errorMessage = '';
  }

  // ... (el resto de los métodos permanecen igual)

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

  get tareasFiltradas(): Tarea[] {
    const searchTextLower = this.searchText.toLowerCase();
    
    return this.tareas.filter(tarea => {
      const estadoMatch = this.filtroEstado === 'todas' || 
        (this.filtroEstado === 'completadas' && tarea.completada) ||
        (this.filtroEstado === 'pendientes' && !tarea.completada);

      const categoriaMatch = this.filtroCategoria === 'todas' || 
        tarea.categoriaId?.toString() === this.filtroCategoria;

      const prioridadMatch = this.filtroPrioridad === 'todas' || 
        tarea.prioridad === this.filtroPrioridad;

      const searchMatch = !this.searchText || 
        tarea.titulo?.toLowerCase().includes(searchTextLower) ||
        (tarea.descripcion && tarea.descripcion.toLowerCase().includes(searchTextLower));

      return estadoMatch && categoriaMatch && prioridadMatch && searchMatch;
    });
  }

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

  toggleCompletada(tarea: Tarea): void {
    if (tarea.completada) {
      const tareaActualizada = { ...tarea, completada: false };
      this.tareaService.actualizarTarea(tarea.id, tareaActualizada).subscribe({
        next: () => {
          this.successMessage = 'Tarea marcada como pendiente';
          this.cargarTareas(this.currentPage);
          this.ocultarMensajeExito();
        },
        error: (error) => {
          this.errorMessage = 'Error al actualizar la tarea';
          console.error('Error actualizando tarea:', error);
        }
      });
    } else {
      this.tareaService.marcarComoCompletada(tarea.id).subscribe({
        next: () => {
          this.successMessage = '¡Tarea completada!';
          this.cargarTareas(this.currentPage);
          this.ocultarMensajeExito();
        },
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
        next: () => {
          this.successMessage = 'Tarea eliminada correctamente';
          this.cargarTareas(this.currentPage);
          this.ocultarMensajeExito();
        },
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

  private ocultarMensajeExito(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  limpiarMensajes(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  get nombreUsuario(): string {
    return this.authService.getCurrentUsername() || 'Usuario';
  }
}