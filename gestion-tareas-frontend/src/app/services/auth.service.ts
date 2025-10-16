import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/usuarios';
  private tokenKey = 'authToken';
  private usuarioKey = 'usuarioData';
  
  private currentUserSubject: BehaviorSubject<any | null>;
  public currentUser: Observable<any | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<any | null>(this.getUsuarioData());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Método para login
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  // Método para registro
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, userData);
  }

  // Método para logout
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usuarioKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ✅ CORREGIDO: Guardar token y datos del usuario
  setAuthData(token: string, usuario: any): void {
    if (!token) {
      console.error('❌ No se puede guardar autenticación: token vacío');
      return;
    }
    
    if (!usuario || !usuario.id) {
      console.error('❌ No se puede guardar autenticación: datos de usuario incompletos', usuario);
      return;
    }
    
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
    this.currentUserSubject.next(usuario);
    console.log('✅ Datos de autenticación guardados:', { 
      token: token.substring(0, 20) + '...', 
      usuario 
    });
  }

  // ✅ NUEVO: Procesar respuesta de login del backend corregido
  procesarLoginExitoso(response: any): void {
    console.log('🔄 Procesando respuesta de login:', response);
    
    if (response.token && response.usuario) {
      this.setAuthData(response.token, response.usuario);
      console.log('✅ Login procesado correctamente');
    } else {
      console.error('❌ Respuesta de login incompleta:', response);
      throw new Error('La respuesta del servidor no contiene los datos necesarios');
    }
  }

  // Obtener token del localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Obtener datos del usuario del localStorage
  getUsuarioData(): any | null {
    const usuarioData = localStorage.getItem(this.usuarioKey);
    return usuarioData ? JSON.parse(usuarioData) : null;
  }

  // Obtener ID del usuario actual
  getCurrentUserId(): number | null {
    const usuario = this.getUsuarioData();
    return usuario ? usuario.id : null;
  }

  // Obtener username del usuario actual
  getCurrentUsername(): string | null {
    const usuario = this.getUsuarioData();
    return usuario ? usuario.username : null;
  }

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    const token = this.getToken();
    const usuario = this.getUsuarioData();
    const isLogged = !!token && !!usuario;
    console.log('🔐 Estado de autenticación:', { token: !!token, usuario: !!usuario, isLogged });
    return isLogged;
  }

  // Obtener usuario actual
  getCurrentUser(): any | null {
    return this.currentUserSubject.value;
  }

  // Para el AuthGuard
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  // Método para debug - ver datos guardados
  debugAuthData(): void {
    const usuario = this.getUsuarioData();
    console.log('🔍 Debug Auth Data:', {
      token: this.getToken() ? '✓ Presente' : '✗ Ausente',
      usuario: usuario,
      isLoggedIn: this.isLoggedIn(),
      currentUserId: this.getCurrentUserId(),
      currentUsername: this.getCurrentUsername()
    });
  }
}