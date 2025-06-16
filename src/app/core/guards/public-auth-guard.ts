import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

export const publicAuthGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const defaultAuthenticatedRoute = '/profile/personal-info'; // Or your main dashboard/home page

  return authService.authState$.pipe(
    take(1),
    map(user => {
      const isAuthenticated = !!user;
      if (isAuthenticated) {
        // User is logged in, redirect them away from auth pages
        console.log('PublicAuthGuard: User is already authenticated, redirecting to dashboard.');
        return true;
      } else {
        // User is not logged in, allow access to the auth page
        return false;
      }
    })
  );
};