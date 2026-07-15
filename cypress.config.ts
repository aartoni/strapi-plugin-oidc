import { defineConfig } from "cypress";
import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter";

export default defineConfig({
  hosts: {
    "cms.strapi.local": "127.0.0.1",
    "auth.strapi.local": "127.0.0.1",
  },
  e2e: {
    allowCypressEnv: false,
    baseUrl: "https://cms.strapi.local",
    video: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    setupNodeEvents(on) {
      installLogsPrinter(on);
    },
  },
});
