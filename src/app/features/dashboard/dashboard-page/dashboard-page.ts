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
import { TitleService } from '../../../core/services/title';

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
  ],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent implements OnInit {
  @HostBinding('class.dashboard-page-host') hostClass = true;

  private router = inject(Router);
  titleService = inject(TitleService); // Signal to hold breadcrumb data


  userName = signal("Alex"); // Example user name, fetch from AuthService or a user service

  serviceCards = signal<ServiceCard[]>([
    {
      id: 'schedule-wash',
      imageUrl: 'https://placehold.co/600x338/e0e0e0/757575?text=Car+Wash+Service', // Placeholder
           title: 'Programar un lavado',
      description: 'Reserva un lavado profesional para tu vehículo a tu conveniencia.',
      buttonText: 'Reservar ahora',
      route: '/services/schedule-wash' // Example route
    },
    {
      id: 'flat-tire',
      imageUrl: 'https://placehold.co/600x338/eeeeee/9e9e9e?text=Tire+Repair', // Placeholder
      title: 'Reparación de pinchazos',
      description: 'Obtén asistencia inmediata para pinchazos, dondequiera que estés.',
      buttonText: 'Solicitar ayuda',
      route: '/services/roadside-assistance' // Example route
    }
  ]);



  constructor() {}

  ngOnInit(): void {
        this.titleService.setTitle('Página principal'); // Set the page title
  
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