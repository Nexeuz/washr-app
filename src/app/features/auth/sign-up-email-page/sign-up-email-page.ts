import { Component, OnInit, ChangeDetectionStrategy, inject, HostBinding, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { AuthService } from '../../../core/services/auth';

// Shared Components

// Services
// import { NotificationService } from '../../../core/services/notification.service'; // Example

// Custom Validator for matching passwords
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordsNotMatching: true });
    return { passwordsNotMatching: true };
  } else if (confirmPassword && confirmPassword.hasError('passwordsNotMatching') && password?.value === confirmPassword?.value) {
    confirmPassword.setErrors(null);
  }
  return null;
}

// Typed Form Interface
interface SignUpEmailForm {
  displayName: FormControl<string | null>; // Optional display name
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
}

@Component({
  selector: 'app-sign-up-email-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent
  ],
  templateUrl: './sign-up-email-page.html',
  styleUrls: ['./sign-up-email-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpEmailPageComponent implements OnInit {
  @HostBinding('class.sign-up-email-page-host') hostClass = true;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  // private notificationService = inject(NotificationService);

  signUpForm!: FormGroup<SignUpEmailForm>;
  signUpError = signal<string | null>(null);

  constructor() {}

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      displayName: new FormControl('', [Validators.required]), // Optional
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]), // Example: min 8 chars
      confirmPassword: new FormControl('', Validators.required)
    }, { validators: passwordsMatchValidator });
  }

  async onSignUp(): Promise<void> {
    this.signUpError.set(null);
    this.signUpForm.markAllAsTouched(); // Mark all fields as touched to show errors

    if (this.signUpForm.valid) {
      const { displayName, email, password } = this.signUpForm.value;
      if (email && password) { // Ensure email and password are not null
        try {
          await this.authService.signUpWithEmailPassword(email, password, displayName || undefined);
          console.log('Sign Up Page - Sign up successful!');
          // Navigate to a dashboard or profile page after successful sign-up
          this.router.navigate(['/profile/personal-info']); // Or '/profile/personal-info'
        } catch (error: any) {
          this.signUpError.set(this.authService.mapFirebaseError(error.code));
          console.error('Sign Up Page - Sign up error:', error);
        }
      } else {
        // This case should ideally not be reached if form is valid due to Validators.required
        this.signUpError.set("Email and password are required.");
         console.error('Sign Up Page - Email or Password is null despite form validity check.');
      }
    } else {
      console.log('Sign Up Page - Form is invalid. Please check the fields.');
      // Optionally show a generic "form invalid" message
      // this.notificationService.showError('Please correct the errors in the form.');
    }
  }

  goBack(): void {
    // Navigate back to the sign-in options page or login page
    this.router.navigate(['/auth/sign-in']);
  }
}