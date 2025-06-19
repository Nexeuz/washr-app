import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Angular Material Modules/Components
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth';
import { LoadingService } from '../../../core/services/loading.service';

interface LoginForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loading = inject(LoadingService); // Assuming you have a loading service

  loginForm!: FormGroup<LoginForm>; // Keep your LoginForm interface
  loginError = signal<string | null>(null);



  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  async onSubmit(): Promise<void> {
    this.loginError.set(null);
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      if (email && password) {
        try {
          await this.authService.loginWithEmailPassword(email, password);
          this.router.navigate(['/profile/personal-info']); // Or your main app page
        } catch (error: any) {
          this.loginError.set(this.authService.mapFirebaseError(error.code));
        }
      }
    }
  }
  
  async onSocialLogin(provider: 'Google' | 'Facebook'): Promise<void> {
    this.loading.showLoading(); // Show loading spinner
    this.loginError.set(null);
    try {
      if (provider === 'Google') await this.authService.loginWithGoogle();
      else if (provider === 'Facebook') await this.authService.loginWithFacebook();
      this.router.navigate(['/profile/personal-info']); // Or your main app page
    } catch (error: any) {
      this.loginError.set(this.authService.mapFirebaseError(error.code));
    } finally {
      this.loading.hideLoading(); // Hide loading spinner
    } 
  }
}