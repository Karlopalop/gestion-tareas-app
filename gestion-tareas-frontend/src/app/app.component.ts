import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gestion-tareas-frontend';

  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

  // Mostrar navbar solo si no estamos en login/registro
  mostrarNavbar(): boolean {
    const currentRoute = this.router.url;
    return currentRoute !== '/login' && currentRoute !== '/registro';
  }

  logout(): void {
    console.log('🚪 Cerrando sesión...');
    this.authService.logout();
  }
}