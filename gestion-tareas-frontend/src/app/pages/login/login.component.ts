import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // ← CAMBIAR por AuthService

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
    private authService: AuthService, // ← CAMBIAR por AuthService
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;

      // ✅ USAR el nuevo AuthService
      this.authService.login(username, password).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          // Guardar el token recibido
          if (response.token) {
            this.authService.setToken(response.token);
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Error: No se recibió token del servidor';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error en el login. Verifica tus credenciales.';
          console.error('Login error:', error);
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/registro']);
  }
}