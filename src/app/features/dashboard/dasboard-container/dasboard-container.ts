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
import { CommonModule } from '@angular/common';


// Interfaces for data structures

interface BottomNavItem {
  icon: string;
  label: string;
  route: string;
  isActive?: boolean;
}



@Component({
  selector: 'app-dasboard-container',
  imports: [PageHeaderComponent, MatIconModule, CommonModule, MatCardModule, MatToolbarModule, MatRippleModule, MatButtonModule, RouterModule],
  templateUrl: './dasboard-container.html',
  styleUrl: './dasboard-container.scss'
})
export class DasboardContainer implements OnInit {


    private router = inject(Router);
     private activeRoute = inject(ActivatedRoute); // Initialize with current rout
    private titleService = inject(TitleService); // Signal to hold breadcrumb data
    private breadcrumb$ = this.titleService.title$; // Signal to hold breadcrumb dat
    title = signal<string>('Dashboard'); // Default title, can be updated based on route

  bottomNavItems = signal<BottomNavItem[]>([
    { icon: 'home', label: 'Inicio', route: '/dasboard', isActive: true },
    { icon: 'directions_car', label: 'Mis Vehículos', route: '/dasboard/vehicles/list' }, // Assuming this route exists
    { icon: 'event_note', label: 'Reservar lavados', route: '/services/scheduled' }, // Assuming this route exists
    { icon: 'person_outline', label: 'Perfil', route: '/dasboard/profile' }
  ]);

  ngOnInit(): void {

    this.breadcrumb$.subscribe(breadcrumb => {
      this.title.set(breadcrumb); // Update the title signal with the breadcrumb data
      // Update the breadcrumb title based on the current route  
  });

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
