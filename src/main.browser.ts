import 'zone.js';
import 'reflect-metadata';
import 'core-js/es/reflect';

import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { AppConfig } from './config/app-config.interface';
import { extendEnvironmentWithAppConfig } from './config/config.util';
import { environment } from './environments/environment';
import { browserAppConfig } from './modules/app/browser-app.config';

// Importaciones para debug
import { isDevMode } from '@angular/core';
import { enableDebugTools } from '@angular/platform-browser';

/*const bootstrap = () => platformBrowserDynamic()
  .bootstrapModule(BrowserAppModule, {});*/
const bootstrap = () => bootstrapApplication(AppComponent, browserAppConfig);

/**
 * We use this to determine have been serven SSR HTML or not.
 *
 * At this point, {@link environment} may not be in sync with the configuration.
 * Therefore, we cannot depend on it to determine how to bootstrap the app.
 */
const hasTransferState = document.querySelector('script#dspace-angular-state') !== null;

// ====== Se habilitan herramientas de debug para Angular ======
const originalWarn = console.warn;
const originalError = console.error;

console.warn = function (...args: any[]) {
  const msg = args.join(' ');
  // NG0500, NG0501... hasta NG0505 son errores de Hydration en Angular
  if (msg.includes('NG050') || msg.toLowerCase().includes('hydration')) {
    // Lo forzamos a mostrarse MUY visible
    originalError.apply(console, ['[ALERTA OCULTA DE HYDRATION]', ...args]);
  }
  originalWarn.apply(console, args);
};

console.error = function (...args: any[]) {
  const msg = args.join(' ');
  if (msg.includes('NG050') || msg.toLowerCase().includes('hydration')) {
    originalError.apply(console, ['[ERROR CRÍTICO DE HYDRATION]', ...args]);
  }
  originalError.apply(console, args);
};
// ====================================================================

const main = () => {
  if (environment.production) {
    enableProdMode();
  }

  if (hasTransferState) {
    // Configuration will be taken from transfer state during initialization
    return bootstrap();
  } else {
    // Configuration must be fetched explicitly
    return fetch('assets/config.json')
      .then((response) => response.json())
      .then((config: AppConfig) => {
        // extend environment with app config for browser when not prerendered
        extendEnvironmentWithAppConfig(environment, config);
        return bootstrap();
      });
  }
};

// support async tag or hmr
if (document.readyState === 'complete' && !hasTransferState) {
  main();
} else {
  document.addEventListener('DOMContentLoaded', main);
}
