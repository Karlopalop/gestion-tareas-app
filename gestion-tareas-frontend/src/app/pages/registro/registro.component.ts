import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  registroForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.registroForm.valid) {
      // Verificar que las contraseñas coincidan
      if (this.registroForm.value.password !== this.registroForm.value.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const usuarioData = {
        username: this.registroForm.value.username,
        email: this.registroForm.value.email,
        password: this.registroForm.value.password
      };

      this.authService.register(usuarioData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = '¡Registro exitoso! Redirigiendo al login...';
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Error en el registro. Intenta con otro usuario o email.';
          console.error('Registro error:', error);
        }
      });
    } else {
      Object.keys(this.registroForm.controls).forEach(key => {
        this.registroForm.get(key)?.markAsTouched();
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}