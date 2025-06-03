import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-sign-in-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './sign-in-page.html',
  styleUrls: ['./sign-in-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPageComponent {

  private authService = inject(AuthService);
  private router = inject(Router);
  signInError = signal<string | null>(null);

  async onContinueWith(method: 'Google' | 'Facebook' | 'Email'): Promise<void> {
    this.signInError.set(null);
    try {
      switch (method) {
        case 'Google':
          await this.authService.loginWithGoogle();
          this.router.navigate(['/profile/personal-info']);
          break;
        case 'Facebook':
          await this.authService.loginWithFacebook();
          this.router.navigate(['/profile/personal-info']);
          break;
        case 'Email':
          await this.authService.loginWithFacebook();
          this.router.navigate(['/profile/personal-info']);
          break;
      }
    } catch (error: any) {
      this.signInError.set(this.authService.mapFirebaseError(error.code));
    }
  }
}