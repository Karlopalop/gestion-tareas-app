import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarea, Prioridad } from '../models/tarea.model';
import { Categoria } from '../models/categoria.model';
import { Usuario, LoginRequest } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

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

    return this.http.get<any>(`${this.apiUrl}/tareas`, { params });
  }

  obtenerTareasPorUsuario(usuarioId: number, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/tareas/usuario/${usuarioId}`, { params });
  }

  // Método original para compatibilidad
  obtenerTodasTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/tareas`);
  }

  crearTarea(tarea: Tarea): Observable<Tarea> {
    return this.http.post<Tarea>(`${this.apiUrl}/tareas`, tarea);
  }

  actualizarTarea(id: number, tarea: Tarea): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.apiUrl}/tareas/${id}`, tarea);
  }

  marcarComoCompletada(id: number): Observable<Tarea> {
    return this.http.patch<Tarea>(`${this.apiUrl}/tareas/${id}/completar`, {});
  }

  eliminarTarea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tareas/${id}`);
  }

  // Nuevos métodos útiles
  obtenerTareasPendientesPorUsuario(usuarioId: number): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/tareas/usuario/${usuarioId}/pendientes`);
  }

  obtenerTareasCompletadasPorUsuario(usuarioId: number): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/tareas/usuario/${usuarioId}/completadas`);
  }
}