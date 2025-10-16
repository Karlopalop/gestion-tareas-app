import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'gestion-tareas-frontend';
  
  // Propiedades para el template
  isLoggedIn = false;
  notification: Notification = {
    show: false,
    message: '',
    type: 'success'
  };

  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a cambios del usuario actual
    this.authSubscription = this.authService.currentUser.subscribe(
      (user) => {
        this.isLoggedIn = !!user;
        
        // Mostrar notificación de bienvenida si se acaba de loguear
        if (user && this.router.url === '/dashboard') {
          this.showNotification('¡Bienvenido a TaskFlow Pro!', 'success');
        }
      }
    );

    // Inicializar el estado de login
    this.isLoggedIn = this.authService.isLoggedIn();

    // Suscribirse a eventos de navegación para ocultar notificaciones
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideNotification();
      }
    });
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.showNotification('Sesión cerrada correctamente', 'success');
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.notification = {
      show: true,
      message,
      type
    };

    // Ocultar automáticamente después de 4 segundos
    setTimeout(() => {
      this.hideNotification();
    }, 4000);
  }

  hideNotification() {
    this.notification.show = false;
  }

  // Método para manejar errores globalmente
  handleError(error: any) {
    console.error('Error global:', error);
    
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    this.showNotification(errorMessage, 'error');
  }
  
}