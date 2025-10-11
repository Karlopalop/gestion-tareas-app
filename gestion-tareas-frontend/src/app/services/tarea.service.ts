import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarea, Prioridad } from '../models/tarea.model'; // Quita Categoria de aquí
import { Categoria } from '../models/categoria.model'; // Añade esta línea
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

  // ========== TAREAS ==========
  obtenerTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/tareas`);
  }

  obtenerTareasPorUsuario(usuarioId: number): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(`${this.apiUrl}/tareas/usuario/${usuarioId}`);
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
}