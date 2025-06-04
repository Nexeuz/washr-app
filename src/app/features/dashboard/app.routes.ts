// Path: src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';
import { publicAuthGuard } from '../../core/guards/public-auth-guard';

export const routes: Routes = [
  // Authentication Feature Routes
  {
    path: 'auth', // Optional parent path for auth-related routes
    canActivate: [publicAuthGuard], // Apply publicAuthGuard to the parent 'auth' route
    children: [
      {
        path: 'login', // Full path: /auth/login
        loadComponent: () =>
          import('../auth/login-page/login-page').then(
            (m) => m.LoginPageComponent
          ),
        title: 'Login - Washr App' // Optional: For browser tab title
      },
      {
        path: 'sign-in', // Full path: /auth/sign-in
        loadComponent: () =>
          import('../auth/sign-in-page/sign-in-page').then(
            (m) => m.SignInPageComponent
          ),
        title: 'Sign In - Washr App'
      },

      {
        path: 'sign-up-email', // Page for email/password creation
        loadComponent: () => import('../auth/sign-up-email-page/sign-up-email-page').then(m => m.SignUpEmailPageComponent),
        title: 'Sign Up - Washr App'
      },


      // You might add a sign-up route here later
      // {
      //   path: 'sign-up',
      //   loadComponent: () => import('./features/auth/sign-up-page/sign-up-page.component').then(m => m.SignUpPageComponent),
      //   title: 'Sign Up - Washr App'
      // },
    ],
  },

  // User Profile Feature Routes
  {
    path: 'profile', // Optional parent path for profile-related routes
   /// canActivate: [authGuard], // Protect this entire feature
    // canActivate: [AuthGuard], // Example: Protect these routes if you have an AuthGuard
    children: [
      {
        path: 'personal-info', // Full path: /profile/personal-info
        loadComponent: () =>
          import(
            '../user-profile/personal-info-page/personal-info-page'
          ).then((m) => m.PersonalInfoPageComponent),
        title: 'Personal Information - Washr App'
      },
            {
        path: 'edit-address',
        loadComponent: () => import('../user-profile/edit-address-page/edit-address-page').then(m => m.EditAddressPageComponent),
        title: 'New Address - Washr App'
      },
      {
        path: 'edit-address/:id',
        loadComponent: () => import('../user-profile/edit-address-page/edit-address-page').then(m => m.EditAddressPageComponent),
        title: 'Edit Address - Washr App'
      },
    ],
  },

   // Service Example Routes (New - based on dashboard card actions)
  {
    path: 'services',
    canActivate: [authGuard],
    loadComponent: () => import('../dashboard/dashboard-page/dashboard-page').then(m => m.DashboardPageComponent),
    children: [
      {
        path: 'schedule-wash',
        // TODO: Create and load ScheduleWashPageComponent
        // l
        // oadComponent: () => import('./features/services/schedule-wash/schedule-wash.component').then(m => m.ScheduleWashComponent),
        redirectTo: '/dashboard', // Placeholder redirect
        title: 'Schedule Wash - Washr App'
      },
      {
        path: 'roadside-assistance',
        // TODO: Create and load RoadsideAssistancePageComponent
        // loadComponent: () => import('./features/services/roadside-assistance/roadside-assistance.component').then(m => m.RoadsideAssistanceComponent),
        redirectTo: '/dashboard', // Placeholder redirect
        title: 'Roadside Assistance - Washr App'
      },
      {
        path: 'scheduled', // For "Scheduled Services" bottom nav
        // TODO: Create and load ScheduledServicesPageComponent
        // loadComponent: () => import('./features/services/scheduled-services/scheduled-services.component').then(m => m.ScheduledServicesComponent),
        redirectTo: '/dashboard', // Placeholder redirect
        title: 'Scheduled Services - Washr App'
      }
    ]
  },

  // Vehicles Feature Routes
  {
    path: 'vehicles', // Optional parent path for vehicle-related routes
    canActivate: [authGuard], // Example: Protect these routes
    children: [
      {
        path: 'add', // Full path: /vehicles/add
        loadComponent: () =>
          import(
            '../vehicles/add-vehicle-page/add-vehicle-page'
          ).then((m) => m.AddVehiclePageComponent),
        title: 'Add Vehicle - Washr App'
      },
      // You might add a vehicle list route here later
      // {
      //   path: 'list',
      //   loadComponent: () => import('./features/vehicles/vehicle-list-page/vehicle-list-page.component').then(m => m.VehicleListPageComponent),
      //   title: 'My Vehicles - Washr App'
      // },
    ],
  },

  // Default and Wildcard Routes
  {
    path: '',
    redirectTo: '/auth/sign-in', // Default route redirects to login
    pathMatch: 'full',
  },
  {
    path: '**', // Wildcard route for a 404 page
    redirectTo: '/auth/sign-in', // Or load a dedicated NotFoundComponent
    // loadComponent: () => import('./core/components/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent),
    // title: 'Page Not Found - Washr App'
  },
];
