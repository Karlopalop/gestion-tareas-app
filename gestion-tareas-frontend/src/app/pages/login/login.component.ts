import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Limpiar datos de sesión anterior al cargar el login
    if (this.authService.isLoggedIn()) {
      console.log('🔄 Sesión anterior detectada, mostrando login limpio');
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;
      console.log('🔄 Intentando login con usuario:', username);

      this.authService.login(username, password).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('✅ Respuesta completa del login:', response);
          
          try {
            // ✅ USAR EL NUEVO MÉTODO DEL BACKEND CORREGIDO
            this.authService.procesarLoginExitoso(response);
            
            console.log('✅ Login exitoso, redirigiendo a dashboard...');
            console.log('👤 Usuario logueado:', this.authService.getCurrentUsername());
            console.log('🆔 ID del usuario:', this.authService.getCurrentUserId());
            
            // Debug: mostrar datos guardados
            this.authService.debugAuthData();
            
            this.router.navigate(['/dashboard']);
          } catch (error: any) {
            this.errorMessage = error.message || 'Error procesando la respuesta del servidor';
            console.error('❌ Error procesando login:', error);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Error completo en login:', error);
          
          if (error.status === 401) {
            this.errorMessage = 'Credenciales incorrectas. Verifica tu usuario y contraseña.';
          } else if (error.status === 0) {
            this.errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose.';
          } else if (error.error && error.error.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Error en el login. Intenta nuevamente.';
          }
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Por favor, completa todos los campos requeridos';
    }
  }

  goToRegister(): void {
    this.router.navigate(['/registro']);
  }

  // Método para limpiar mensajes de error
  clearError(): void {
    this.errorMessage = '';
  }

  // Métodos para validación visual del formulario
  get usernameInvalid(): boolean {
    const control = this.loginForm.get('username');
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.get('password');
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }
}