import { defineConfig } from 'cypress';
import installLogsPrinter from 'cypress-terminal-report/src/installLogsPrinter';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:1337',
    specPattern: '**/*.cy.{js,ts,jsx,tsx}',
    video: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    setupNodeEvents(on) {
      installLogsPrinter(on);
    },
  },
});
