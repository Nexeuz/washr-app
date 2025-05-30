// Path: src/app/features/auth/login-page/login-page.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, ValidatorFn } from '@angular/forms';
import { RouterLink } from '@angular/router'; // For navigation links
import { ButtonComponent } from '../../../shared/components/button/button';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field';
import { IconComponent } from '../../../shared/components/icon/icon';
import { FormControlErrorComponent } from "../../../shared/components/form-control-error/form-control-error";


// Example: For future authentication logic
// import { AuthService } from '../../../core/services/auth.service';

// Define a typed interface for the login form
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
    ButtonComponent,
    InputFieldComponent,
    IconComponent // Add if app-icon is used in the template for social buttons
    ,
    FormControlErrorComponent
],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup<LoginForm>;
    emailValidators: ValidatorFn[] = [Validators.required, Validators.email];
    passwordValidators: ValidatorFn[] = [Validators.required, Validators.minLength(6)];


  // Example SVG strings for social icons (manage these centrally or as assets in a real app)
  // Replace with your actual SVG content or use the app-icon component with an SVG map/service
  readonly googleIconSvg = `<svg viewBox="0 0 24 24" width="20px" height="20px" fill="currentColor" class="mr-2"><path d="M22.56,12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26,1.37-1.04,2.53-2.21,3.31v2.77h3.57c2.08-1.92,3.28-4.74,3.28-8.09Z" fill="#4285F4"/><path d="M12,23c2.97,0,5.46-.98,7.28-2.66l-3.57-2.77c-.98.66-2.23,1.06-3.71,1.06-2.86,0-5.29-1.93-6.16-4.53H2.18v2.84C3.99,20.53,7.7,23,12,23Z" fill="#34A853"/><path d="M5.84,14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43,8.55,1,10.22,1,12s.43,3.45,1.18,4.93l2.85-2.22.81-.62Z" fill="#FBBC05"/><path d="M12,5.38c1.62,0,3.06.56,4.21,1.69l3.15-3.15C17.45,2.28,15.01,1,12,1,7.7,1,3.99,3.47,2.18,7.07l3.66,2.84c.87-2.6,3.3-4.53,6.16-4.53Z" fill="#EA4335"/></svg>`;
  readonly facebookIconSvg = `<svg viewBox="0 0 24 24" width="20px" height="20px" fill="currentColor" class="mr-2"><path d="M22,12c0-5.52-4.48-10-10-10S2,6.48,2,12c0,4.84,3.44,8.87,8,9.8V15H8v-3h2V9.5C10,7.57,11.57,6,13.5,6H16v3h-1.7c-.9,0-1.08.43-1.08.95V12h2.77L15.5,15h-2.72v6.8C18.56,20.87,22,16.84,22,12Z"/></svg>`;


  constructor(
    private fb: FormBuilder
    // private authService: AuthService // Example: Inject your authentication service
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: new FormControl('', this.emailValidators),
      password: new FormControl('', this.passwordValidators)
    }, { updateOn: 'blur' });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log('Login Page - Form Submitted:', { email, password });
      // Example: this.authService.login(email, password).subscribe(...);
    } else {
      this.loginForm.markAllAsTouched(); // Trigger validation messages to display
      console.log('Login Page - Form is invalid');
    }
  }

  onSocialLogin(provider: 'Google' | 'Facebook'): void {
    console.log(`Login Page - Attempting social login with ${provider}`);
    // Example: this.authService.socialLogin(provider).subscribe(...);
  }
}