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

// Interfaces for data structures
interface ServiceCard {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  action?: () => void;
  route?: string;
}

interface BottomNavItem {
  icon: string; // Material Icon name
  label: string;
  route: string;
  isActive?: boolean;
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

  bottomNavItems = signal<BottomNavItem[]>([
    { icon: 'home', label: 'Home', route: '/dashboard', isActive: true },
    { icon: 'directions_car', label: 'My Vehicles', route: '/vehicles/list' }, // Assuming this route exists
    { icon: 'event_note', label: 'Scheduled', route: '/services/scheduled' }, // Assuming this route exists
    { icon: 'person_outline', label: 'Profile', route: '/profile/personal-info' }
  ]);

  constructor() {}

  ngOnInit(): void {
    // Update active state of bottomNavItems based on current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveNavItem();
    });
    this.updateActiveNavItem(); // Initial check
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

  onBottomNavItemClick(clickedItem: BottomNavItem): void {
    this.router.navigate([clickedItem.route]);
    // Active state will be updated by the router events subscription
  }

  private updateActiveNavItem(): void {
    const currentRoute = this.router.url;
    this.bottomNavItems.update(items =>
      items.map(item => ({
        ...item,
        // A simple check, might need more sophisticated logic for child routes
        isActive: currentRoute === item.route || (item.route !== '/dashboard' && currentRoute.startsWith(item.route))
      }))
    );
  }
}