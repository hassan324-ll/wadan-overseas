import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: 'AIzaSyCa_TYqc1FoKDFX0JCjncZNB_gPdsOlm7o',
  authDomain: 'wadan-8a3a1.firebaseapp.com',
  projectId: 'wadan-8a3a1',
  storageBucket: 'wadan-8a3a1.firebasestorage.app',
  messagingSenderId: '946729274629',
  appId: '1:946729274629:web:e08ed2b4b09ea41727bb6c',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
};
