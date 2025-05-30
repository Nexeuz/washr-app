// Path: src/app/features/auth/sign-in-page/sign-in-page.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // For navigation links

// Shared Components
import { ButtonComponent } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon'; // If you plan to add icons to buttons

// Example: For future authentication logic
// import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sign-in-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    IconComponent // Import if you decide to use icons within the buttons
  ],
  templateUrl: './sign-in-page.html',
  styleUrls: ['./sign-in-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPageComponent {

  // Example SVG strings for social icons if you want to add them
  // readonly googleIconSvg = `<svg ...></svg>`;
  // readonly facebookIconSvg = `<svg ...></svg>`;
  // readonly emailIconSvg = `<svg ...></svg>`;

  constructor(
    // private authService: AuthService // Example: Inject your authentication service
    // private router: Router // Inject if you need to navigate programmatically
  ) {}

  onContinueWith(method: 'Google' | 'Facebook' | 'Email'): void {
    console.log(`Sign In Page - Continue with ${method}`);
    switch (method) {
      case 'Google':
        // this.authService.socialLogin('Google').subscribe(...);
        break;
      case 'Facebook':
        // this.authService.socialLogin('Facebook').subscribe(...);
        break;
      case 'Email':
        // This would typically navigate to a different page for email/password sign-up or login
        // this.router.navigate(['/auth/sign-up-email']); or
        // this.router.navigate(['/auth/login-email']);
        console.log('Navigate to email sign-in/sign-up flow');
        break;
    }
  }
}