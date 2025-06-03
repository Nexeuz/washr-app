import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
// Import Material Form Field, Input, Button Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';

interface SignUpForm {
  displayName: FormControl<string | null>; // Optional
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  // confirmPassword: FormControl<string | null>; // Add if you want confirm password field
}

@Component({
  selector: 'app-sign-up-email-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, PageHeaderComponent],
  templateUrl: './sign-up-email-page.html',
  // styleUrls: ['./sign-up-email-page.component.scss']
})
export class SignUpEmailPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signUpForm!: FormGroup<SignUpForm>;
  signUpError = signal<string | null>(null);

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      displayName: new FormControl(''), // Optional
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      // confirmPassword: new FormControl('', Validators.required)
    }/*, { validators: passwordsMatchValidator } // Add if using confirmPassword */);
  }

  async onSignUp(): Promise<void> {
    this.signUpError.set(null);
    this.signUpForm.markAllAsTouched();
    if (this.signUpForm.valid) {
      const { displayName, email, password } = this.signUpForm.value;
      if (email && password) {
        try {
          await this.authService.signUpWithEmailPassword(email, password, displayName || undefined);
          console.log('Sign up successful!');
          this.router.navigate(['/profile/personal-info']); // Or dashboard
        } catch (error: any) {
          this.signUpError.set(this.authService.mapFirebaseError(error.code));
        }
      }
    } else {
      console.log('Sign up form is invalid.');
    }
  }
  goBack() { this.router.navigate(['/auth/sign-in']); }
}