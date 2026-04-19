import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { headersInterceptor } from './core/interceptors/headers-interceptor';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { loadingInterceptor } from './core/interceptors/loading-interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), provideClientHydration(withEventReplay()),
    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'top'
    }), withViewTransitions()
      // , withHashLocation()
    ),
    importProvidersFrom(CookieService, NgxSpinnerModule),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, headersInterceptor, loadingInterceptor]))
  ]
};
