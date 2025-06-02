// Path: src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Authentication Feature Routes
  {
    path: 'auth', // Optional parent path for auth-related routes
    children: [
      {
        path: 'login', // Full path: /auth/login
        loadComponent: () =>
          import('./features/auth/login-page/login-page').then(
            (m) => m.LoginPageComponent
          ),
        title: 'Login - Washr App' // Optional: For browser tab title
      },
      {
        path: 'sign-in', // Full path: /auth/sign-in
        loadComponent: () =>
          import('./features/auth/sign-in-page/sign-in-page').then(
            (m) => m.SignInPageComponent
          ),
        title: 'Sign In - Washr App'
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
    // canActivate: [AuthGuard], // Example: Protect these routes if you have an AuthGuard
    children: [
      {
        path: 'personal-info', // Full path: /profile/personal-info
        loadComponent: () =>
          import(
            './features/user-profile/personal-info-page/personal-info-page'
          ).then((m) => m.PersonalInfoPageComponent),
        title: 'Personal Information - Washr App'
      },
      {
        path: 'edit-address', // Full path: /profile/edit-address
        loadComponent: () =>
          import(
            './features/user-profile/edit-address-page/edit-address-page'
          ).then((m) => m.EditAddressPageComponent),
        title: 'Edit Address - Washr App'
      },
      // Example for editing a specific address if you implement that
      // {
      //   path: 'edit-address/:id',
      //   loadComponent: () => import('./features/user-profile/edit-address-page/edit-address-page.component').then(m => m.EditAddressPageComponent),
      //   title: 'Edit Address - Washr App'
      // },
    ],
  },

  // Vehicles Feature Routes
  {
    path: 'vehicles', // Optional parent path for vehicle-related routes
    // canActivate: [AuthGuard], // Example: Protect these routes
    children: [
      {
        path: 'add', // Full path: /vehicles/add
        loadComponent: () =>
          import(
            './features/vehicles/add-vehicle-page/add-vehicle-page'
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
    redirectTo: '/auth/login', // Default route redirects to login
    pathMatch: 'full',
  },
  {
    path: '**', // Wildcard route for a 404 page
    redirectTo: '/auth/login', // Or load a dedicated NotFoundComponent
    // loadComponent: () => import('./core/components/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent),
    // title: 'Page Not Found - Washr App'
  },
];
