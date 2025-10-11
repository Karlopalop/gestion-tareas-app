import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token del servicio de autenticación
    const token = this.authService.getToken();
    
    console.log('🔐 Interceptor ejecutándose');
    console.log('📨 Request URL:', request.url);
    console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');
    
    // Si hay token, clonar la request y agregar el header Authorization
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Header Authorization agregado');
    } else {
      console.log('❌ No hay token - Request sin autorización');
    }

    // Continuar con la request modificada
    return next.handle(request);
  }
}