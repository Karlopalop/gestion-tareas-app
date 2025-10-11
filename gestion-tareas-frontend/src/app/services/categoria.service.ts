import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, ColorCategoria, TipoCategoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:8080/api/categorias';

  constructor(private http: HttpClient) { }

  // ========== OPERACIONES CRUD DE CATEGORÍAS ==========

  // Obtener todas las categorías
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // Obtener categoría por ID
  obtenerCategoriaPorId(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva categoría
  crearCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  // Actualizar categoría existente
  actualizarCategoria(id: number, categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria);
  }

  // Eliminar categoría
  eliminarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Buscar categorías por nombre
  buscarCategoriasPorNombre(nombre: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/buscar?nombre=${nombre}`);
  }

  // Métodos útiles para trabajar con categorías
  getColoresDisponibles(): string[] {
    return Object.values(ColorCategoria);
  }

  getTiposCategoria(): string[] {
    return Object.values(TipoCategoria);
  }
}