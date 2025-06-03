// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1), // Important to prevent ongoing subscription after guard execution
    map(user => {
      const isAuthenticated = !!user;
      if (isAuthenticated) {
        return true;
      } else {
        console.log('AuthGuard: User not authenticated, redirecting to login.');
        return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
      }
    })
  );
};
