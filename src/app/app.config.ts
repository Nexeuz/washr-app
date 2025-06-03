import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';

import { routes } from './features/dashboard/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


// Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
// import { getFirestore, provideFirestore } from '@angular/fire/firestore'; // If you use Firestore
// import { getStorage, provideStorage } from '@angular/fire/storage'; // If you use Storage

const firebaseConfig = {
 apiKey: "AIzaSyAdR3pxo_MZg8CYNZab-aLmvNh2iUYeTXY",
  authDomain: "wash-r-app.firebaseapp.com",
  projectId: "wash-r-app",
  storageBucket: "wash-r-app.firebasestorage.app",
  messagingSenderId: "246464851954",
  appId: "1:246464851954:web:8459179c358b141b08456b",
  measurementId: "G-6VZ3SP4P36"
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),    
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    // Firebase providers directly in the array:
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    // provideFirestore(() => getFirestore()), // Uncomment if you use Firestore
    // provideStorage(() => getStorage())      // Uncomment if you use Firebase Storage
  ]
};


