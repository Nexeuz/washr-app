import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  onContinueWith(method: 'Google' | 'Facebook' | 'Email'): void {
    console.log(`Sign In Page - Continue with ${method}`);
    // Add actual logic here
  }
}