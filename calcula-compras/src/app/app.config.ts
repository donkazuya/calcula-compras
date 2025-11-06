import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideNgxMask } from 'ngx-mask';
import { provideHttpClient } from '@angular/common/http';
import {  tuiAssetsPathProvider} from '@taiga-ui/core';
import {NG_EVENT_PLUGINS} from '@taiga-ui/event-plugins';
import {provideAnimations} from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideNgxMask(),
    tuiAssetsPathProvider('https://taiga-ui.dev/assets/taiga-ui/icons'),
    NG_EVENT_PLUGINS,
    provideAnimations(),
    {provide: 'LOCALE_ID', useValue: 'pt-BR'}
  ]
};
