import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header";
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';


// Interfaces for data structures

interface BottomNavItem {
  icon: string;
  label: string;
  route: string;
  isActive?: boolean;
}



@Component({
  selector: 'app-dasboard-container',
  imports: [PageHeaderComponent, MatIconModule, MatCardModule, MatToolbarModule, MatRippleModule, MatButtonModule, RouterModule],
  templateUrl: './dasboard-container.html',
  styleUrl: './dasboard-container.scss'
})
export class DasboardContainer implements OnInit {

    private router = inject(Router);

  bottomNavItems = signal<BottomNavItem[]>([
    { icon: 'home', label: 'Home', route: '/dashboard', isActive: true },
    { icon: 'directions_car', label: 'My Vehicles', route: 'dasboard/vehicles/list' }, // Assuming this route exists
    { icon: 'event_note', label: 'Scheduled', route: '/services/scheduled' }, // Assuming this route exists
    { icon: 'person_outline', label: 'Profile', route: '/profile/personal-info' }
  ]);

  ngOnInit(): void {
    // Update active state of bottomNavItems based on current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveNavItem();
    });
    this.updateActiveNavItem(); // Initial check
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
