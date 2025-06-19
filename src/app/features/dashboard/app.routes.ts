// Path: src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth-guard';
import { profileCompletedashboard as profileCompleteAuthAllowGuard, profileCompleteGuardAuth, profileCompleteGuardProfile } from '../../core/guards/profile-complete-guard';

export const routes: Routes = [
  // Authentication Feature Routes
  {
    path: 'auth', // Optional parent path for auth-related routes
    children: [
      {
        path: 'login', // Full path: /auth/login
        loadComponent: () =>
          import('../auth/login-page/login-page').then(
            (m) => m.LoginPageComponent
          ),
        canActivate: [profileCompleteGuardAuth], // Apply publicAuthGuard to the parent 'auth' route
        title: 'Login - Washr App' // Optional: For browser tab title
      },
      {
        path: 'sign-in', // Full path: /auth/sign-in
        loadComponent: () =>
          import('../auth/sign-in-page/sign-in-page').then(
            (m) => m.SignInPageComponent
          ),
        canActivate: [profileCompleteGuardAuth], // Apply publicAuthGuard to the parent 'auth' route
        title: 'Sign In - Washr App'
      },
      {
        canActivate: [profileCompleteGuardAuth], // Apply publicAuthGuard to the parent 'auth' route
        path: 'sign-up-email', // Page for email/password creation
        loadComponent: () => import('../auth/sign-up-email-page/sign-up-email-page').then(m => m.SignUpEmailPageComponent),
        title: 'Sign Up - Washr App'
      },
      {
        path: 'vehicles',
        canActivate: [profileCompleteAuthAllowGuard], // Apply publicAuthGuard to the parent 'auth' route

        children: [
          {
            path: 'list',
            loadComponent: () => import('../vehicles/vehicle-list-page/vehicle-list-page').then(m => m.VehicleListPageComponent),
            title: 'List Vehicles - Washr App'
          },
          {
            path: 'add/new',
            loadComponent: () => import('../vehicles/add-vehicle-page/add-vehicle-page').then(m => m.AddVehiclePageComponent),
            title: 'Add Vehicle - Washr App',
          },
          {
            path: 'edit/:userId/:vehicleId',
            loadComponent: () => import('../vehicles/add-vehicle-page/add-vehicle-page').then(m => m.AddVehiclePageComponent),
            title: 'Edit Vehicle - Washr App'
          },
          {
            path: '**', // Wildcard route for vehicles
            redirectTo: 'list', // Redirect to the vehicle list if no specific route matches
          }
        ]
      },


      {
        path: '**', // Wildcard route for vehicles
        redirectTo: 'sign-in', // Redirect to the vehicle list if no specific route matches
      },
    ],

  },

  // User Profile Feature Routes
  {
    path: 'profile', // Optional parent path for profile-related routes
    /// canActivate: [authGuard], // Protect this entire feature
    canActivate: [profileCompleteGuardProfile], // Example: Protect these routes if you have an AuthGuard
    children: [
      {
        path: 'personal-info', // Full path: /profile/personal-info
        loadComponent: () =>
          import(
            '../user-profile/personal-info-page/personal-info-page'
          ).then((m) => m.PersonalInfoPageComponent),
        title: 'Personal Information - Washr App'
      },
    ],
  },

  {
    path: 'dashboard',
    canActivate: [profileCompleteAuthAllowGuard],
    loadComponent: () => import('../dashboard/dashboard-container/dashboard-container').then(m => m.DashboardContainer),
    children: [
      {
        path: 'home', // Default child route for dashboard
        loadComponent: () => import('../dashboard/dashboard-page/dashboard-page').then(m => m.DashboardPageComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('../profile/profile-page/profile-page').then(m => m.ProfilePageComponent),
        data: { title: 'Mi Perfil' }, // Added for TitleService,
        children: [
          {
            path: 'update-phone/:userId:/:phoneNumber',
            loadComponent: () => import('../profile/profile-phone-number-sheet/profile-phone-number-sheet').then(m => m.ProfilePhoneNumberSheetComponent),
            title: 'Update Phone - Washr App',
          }
        ]
      },
      {
        path: 'vehicles',
        children: [
          {
            path: 'list',
            loadComponent: () => import('../vehicles/vehicle-list-page/vehicle-list-page').then(m => m.VehicleListPageComponent),
            title: 'List Vehicles - Washr App',
          },
          {
            path: 'add/new',
            loadComponent: () => import('../vehicles/add-vehicle-page/add-vehicle-page').then(m => m.AddVehiclePageComponent),
            title: 'Add Vehicle - Washr App',
          },
          {
            path: 'edit/:userId/:vehicleId',
            loadComponent: () => import('../vehicles/add-vehicle-page/add-vehicle-page').then(m => m.AddVehiclePageComponent),
            title: 'Edit Vehicle - Washr App',
          },
          {
            path: '**', // Wildcard route for vehicles
            redirectTo: 'list', // Redirect to the vehicle list if no specific route matches
          }
        ]
      },
      {
        path: '**',
        redirectTo: 'home', // Redirect to home if no specific route matches
      }
    ]
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
