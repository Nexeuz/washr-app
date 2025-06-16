// =================================================================================
// features/dashboard/dashboard-page/dashboard-page.component.ts
// Path: src/app/features/dashboard/dashboard-page/dashboard-page.component.ts
// =================================================================================
import { Component, OnInit, ChangeDetectionStrategy, signal, inject, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';

// Shared Components (ensure PageHeaderComponent is also not using Tailwind for its internal layout if this is a full switch)

interface ServiceCard {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  action?: () => void;
  route?: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule,
    MatRippleModule,
    PageHeaderComponent
  ],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent implements OnInit {
  @HostBinding('class.dashboard-page-host') hostClass = true;

  private router = inject(Router);

  userName = signal("Alex"); // Example user name, fetch from AuthService or a user service

  serviceCards = signal<ServiceCard[]>([
    {
      id: 'schedule-wash',
      imageUrl: 'https://placehold.co/600x338/e0e0e0/757575?text=Car+Wash+Service', // Placeholder
      title: 'Schedule a Wash',
      description: 'Book a professional wash for your vehicle at your convenience.',
      buttonText: 'Book Now',
      route: '/services/schedule-wash' // Example route
    },
    {
      id: 'flat-tire',
      imageUrl: 'https://placehold.co/600x338/eeeeee/9e9e9e?text=Tire+Repair', // Placeholder
      title: 'Flat Tire Fix',
      description: 'Get immediate assistance for flat tires, wherever you are.',
      buttonText: 'Request Help',
      route: '/services/roadside-assistance' // Example route
    }
  ]);



  constructor() {}

  ngOnInit(): void {
  
  }

  handleCardAction(card: ServiceCard): void {
    if (card.route) {
      this.router.navigate([card.route]);
    } else if (card.action) {
      card.action();
    }
    console.log(`Action for: ${card.title}`);
  }

  onSettingsClick(): void {
    console.log('Settings icon clicked');
    this.router.navigate(['/profile/settings']); // Example settings route
  }



  
}