import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore'; // Firestore imports
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError, take } from 'rxjs/operators';
import { User } from '@angular/fire/auth';
import { AuthService } from '../services/auth';

export const profileCompleteGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const firestore = inject(Firestore);
  const router = inject(Router);
  const profileCompletionRoute = '/profile/personal-info'; // Where to redirect if profile is incomplete

  return authService.authState$.pipe(
    take(1), // Take the first emitted auth state to avoid ongoing subscriptions
    switchMap((user: User | null) => {
      if (!user) {
        // This case should ideally be handled by a preceding authGuard.
        // If authGuard is not used before this, or as a fallback:
        console.log('ProfileCompleteGuard: No user authenticated, redirecting to login.');
        return of(router.createUrlTree(['/auth/login']
          
        ));
      }

      // User is authenticated, now check their Firestore profile
      const userDocRef = doc(firestore, `users/${user.uid}`);
      return from(getDoc(userDocRef)).pipe(
        map(docSnap => {
          if (docSnap.exists() && docSnap.data()?.['isRegistrationComplete'] === true) {
            console.log('ProfileCompleteGuard: Registration complete, access granted.');
            return true; // Profile is complete, allow access
          } else {
            console.log('ProfileCompleteGuard: Registration incomplete or document missing, redirecting to complete profile.');
            // Profile is not complete or document doesn't exist, redirect
            return router.createUrlTree([profileCompletionRoute]);
          }
        }),
        catchError((error) => {
          console.error('ProfileCompleteGuard: Error fetching user profile:', error);
          // On error fetching profile, redirect to profile completion or an error page as a fallback
          return of(router.createUrlTree([profileCompletionRoute]));
        })
      );
    })
  );
};