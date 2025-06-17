import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header";
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { TitleService } from '../../../core/services/title';
import { CommonModule, Location } from '@angular/common';


// Interfaces for data structures

interface BottomNavItem {
  icon: string;
  label: string;
  route: string;
  isActive?: boolean;
}



@Component({
  selector: 'app-dashboard-container',
  imports: [PageHeaderComponent, MatIconModule, CommonModule, MatCardModule, MatToolbarModule, MatRippleModule, MatButtonModule, RouterModule],
  templateUrl: './dashboard-container.html',
  styleUrl: './dashboard-container.scss'
})
export class DashboardContainer implements OnInit {



  private router = inject(Router);
  private activeRoute = inject(ActivatedRoute); // Initialize with current rout
  private titleService = inject(TitleService); // Signal to hold breadcrumb data
  private breadcrumb$ = this.titleService.title$; // Signal to hold breadcrumb dat
  private location = inject(Location); // Inject Angular's Location service
  title = signal<string>('Dashboard'); // Default title, can be updated based on route
  isChildRoute = signal<boolean>(false); // Flag to determine if the current route is a child route
  

  bottomNavItems = signal<BottomNavItem[]>([
    { icon: 'home', label: 'Inicio', route: '/dashboard/home' },
    { icon: 'directions_car', label: 'Mis Vehículos', route: '/dashboard/vehicles' }, // Assuming this route exists
    { icon: 'event_note', label: 'Reservar', route: '/services/scheduled' }, // Assuming this route exists
    { icon: 'person_filled', label: 'Perfil', route: '/dashboard/profile' }
  ]);

  ngOnInit(): void {

    this.breadcrumb$.subscribe(breadcrumb => {
      this.title.set(breadcrumb); // Update the title signal with the breadcrumb value
      // Optionally, you can also update the document title or any other UI element here
      // Update the breadcrumb title based on the current route  
    });

    // Update active state of bottomNavItems based on current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.detectWhenIsAChildRoute();
      this.updateActiveNavItem();
    });
    this.updateActiveNavItem(); // Initial check

  }
  detectWhenIsAChildRoute() {
    const currentUrl = this.router.url;
    const segments = currentUrl.split('/').filter(Boolean); // filter to remove empty strings

    this.isChildRoute.set(segments.length > 3);
  }




  onBottomNavItemClick(clickedItem: BottomNavItem): void {
    this.router.navigate([clickedItem.route]);
    // Active state will be updated by the router events subscription
  }

  private updateActiveNavItem(): void {
    const currentRoute = this.router.url;
    console.log('Current s:', currentRoute);
    const splittedRoute = currentRoute.split('/'); // Remove query parameters for matching
    console.log('Current route:', splittedRoute);

    this.bottomNavItems.update(items =>
      items.map(item => ({
        ...item,
        // A simple check, might need more sophisticated logic for child routes
        isActive: currentRoute.includes(splittedRoute[2])
      }))
    );
  }

  backOnClick() {
    this.location.back(); // Navigate back in history
  }


}
