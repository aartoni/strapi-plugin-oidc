import { defineConfig } from 'cypress';
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';

export default defineConfig({
  hosts: {
    'cms.strapi.local': '127.0.0.1',
    'auth.strapi.local': '127.0.0.1',
  },
  e2e: {
    baseUrl: 'https://cms.strapi.local',
    specPattern: '**/*.cy.{js,ts,jsx,tsx}',
    video: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    // Required for the OIDC flow: the browser crosses origins
    // (cms.strapi.local -> auth.strapi.local -> back).
    // TODO Should we cover this via CORS configuration?
    chromeWebSecurity: false,
    setupNodeEvents(on) {
      installLogsPrinter(on);
    },
  },
});
