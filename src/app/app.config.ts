import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';

import { routes } from './features/dashboard/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


// Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
 import { getStorage, provideStorage } from '@angular/fire/storage'; // If you use Storage

 import { firebaseConfig } from './core/config/firebase.key'; // Ensure this points to your Firebase config
import { LoadingService } from './core/services/loading.service';



export const appConfig: ApplicationConfig = {
  providers: [
    LoadingService,
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
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage())      // Uncomment if you use Firebase Storage
  ]
};


