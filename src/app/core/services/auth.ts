import { Injectable, inject, WritableSignal, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, User, UserCredential, updateProfile } from '@angular/fire/auth';
import { Observable, from, BehaviorSubject, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

 // Use ReplaySubject(1) to ensure guards get the first definitive value from onAuthStateChanged
  private authStateInternal$ = new ReplaySubject<User | null>(1);
  readonly authState$: Observable<User | null> = this.authStateInternal$.asObservable();
  // Signal for current user (alternative to observable for some use cases)
  readonly currentUserSignal: WritableSignal<User | null> = signal(this.auth.currentUser);

  constructor() {
    // onAuthStateChanged is the primary source of truth for the auth state.
    // It fires once on initialization with the current user (or null) and then on any change.
    onAuthStateChanged(this.auth,
      (user) => {
        this.authStateInternal$.next(user); // Emit the user state to ReplaySubject
        this.currentUserSignal.set(user);
        if (user) {
          console.log('AuthService (onAuthStateChanged): User is logged in', user.uid);
        } else {
          console.log('AuthService (onAuthStateChanged): User is logged out');
        }
      },
      (error) => {
        console.error('AuthService (onAuthStateChanged) error:', error);
        this.authStateInternal$.next(null); // Emit null on error
        this.currentUserSignal.set(null);
      }
    );
  }

  getCurrentUser(): User | null {
    // This might still be null during very early app init before onAuthStateChanged fires its first value.
    // authState$ or currentUserSignal are more reliable for reactive scenarios.
    return this.auth.currentUser;
  }

  async signUpWithEmailPassword(email: string, password: string, displayName?: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: displayName });
      }
      return userCredential;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }

  async loginWithEmailPassword(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    // Optional: Add custom parameters or scopes
    // provider.addScope('profile');
    // provider.addScope('email');
    try {
      return await signInWithPopup(this.auth, provider);
    } catch (error) {
      console.error("Error with Google login:", error);
      throw error;
    }
  }

  async loginWithFacebook(): Promise<UserCredential> {
    const provider = new FacebookAuthProvider();
    // Optional: Add custom parameters or scopes
    // provider.addScope('email');
    // provider.addScope('public_profile');
    try {
      return await signInWithPopup(this.auth, provider);
    } catch (error) {
      console.error("Error with Facebook login:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/auth/login']); // Redirect to login after logout
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  }

  // Helper to map Firebase error codes to user-friendly messages
  mapFirebaseError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email': return 'Invalid email format.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Invalid email or password.';
      case 'auth/email-already-in-use': return 'This email is already registered.';
      case 'auth/weak-password': return 'Password should be at least 6 characters.';
      case 'auth/popup-closed-by-user': return 'Login popup was closed. Please try again.';
      case 'auth/account-exists-with-different-credential': return 'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.';
      // Add more specific Firebase error codes as needed
      default:
        console.warn('Unhandled Firebase error code:', errorCode);
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
