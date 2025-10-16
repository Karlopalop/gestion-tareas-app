import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarea, Prioridad } from '../models/tarea.model';
import { Categoria } from '../models/categoria.model';
import { Usuario, LoginRequest } from '../models/usuario.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // ✅ NUEVO: Método para obtener headers con el usuario ID
  private getHeaders(): HttpHeaders {
    const usuarioId = this.authService.getCurrentUserId();
    if (!usuarioId) {
      console.warn('⚠️ No hay usuario logueado, usando ID por defecto 1');
      // En un caso real, redirigirías al login
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Usuario-Id': usuarioId ? usuarioId.toString() : '1' // Temporal: usar 1 si no hay usuario
    });
    
    return headers;
  }

  // ========== USUARIOS ==========
  registrarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios/registro`, usuario);
  }

  login(loginRequest: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/login`, loginRequest);
  }

  // ========== CATEGORÍAS ==========
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  crearCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/categorias`, categoria);
  }

  // ========== TAREAS CON PAGINACIÓN ==========
  obtenerTareas(page: number = 0, size: number = 10, sort: string = 'id'): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<any>(`${this.apiUrl}/tareas`, { 
      params, 
      headers: this.getHeaders() 
    });
  }

  obtenerTareasPorUsuario(usuarioId: number, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/tareas/usuario/${usuarioId}`, { params });
  }

  // Método original para compatibilidad
  obtenerTodasTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/tareas`, { 
      headers: this.getHeaders() 
    });
  }

  crearTarea(tarea: Tarea): Observable<Tarea> {
    return this.http.post<Tarea>(`${this.apiUrl}/tareas`, tarea, { 
      headers: this.getHeaders() 
    });
  }

  actualizarTarea(id: number, tarea: Tarea): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.apiUrl}/tareas/${id}`, tarea, { 
      headers: this.getHeaders() 
    });
  }

  marcarComoCompletada(id: number): Observable<Tarea> {
    return this.http.patch<Tarea>(`${this.apiUrl}/tareas/${id}/completar`, {}, { 
      headers: this.getHeaders() 
    });
  }

  eliminarTarea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tareas/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  // Nuevos métodos útiles
  obtenerTareasPendientesPorUsuario(usuarioId: number): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/tareas/usuario/${usuarioId}/pendientes`);
  }

  obtenerTareasCompletadasPorUsuario(usuarioId: number): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/tareas/usuario/${usuarioId}/completadas`);
  }

  // ✅ NUEVO: Método para obtener tareas próximas a vencer
  obtenerTareasProximasAVencer(usuarioId: number): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/tareas/usuario/${usuarioId}/proximas-vencer`);
  }

  // ✅ NUEVO: Método para buscar tareas por título
  buscarTareasPorTitulo(usuarioId: number, titulo: string): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/tareas/usuario/${usuarioId}/buscar?titulo=${titulo}`);
  }
}