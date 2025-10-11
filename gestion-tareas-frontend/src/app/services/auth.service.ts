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
  private currentUserSubject: BehaviorSubject<string | null>;
  public currentUser: Observable<string | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<string | null>(this.getToken());
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
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Guardar token en localStorage
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.currentUserSubject.next(token);
    console.log('✅ Token guardado:', token);
  }

  // Obtener token del localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Obtener usuario actual
  getCurrentUser(): string | null {
    return this.currentUserSubject.value;
  }
}