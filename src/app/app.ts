import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {

  authService = inject(AuthService);

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
  iconRegistry.addSvgIcon(
      'google-brand-logo', // Name you'll use in <mat-icon svgIcon="...">
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/google-logo.svg')
    );

    // Register the Facebook logo SVG from assets
    iconRegistry.addSvgIcon(
      'facebook-brand-logo', // Name you'll use
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/facebook-logo.svg')
    );
  }
  // Use the signal from AuthService or subscribe to authState$
  currentUser = this.authService.currentUserSignal; // Using the signal directly

  async logout(): Promise<void> {
    await this.authService.logout();

  }

}
