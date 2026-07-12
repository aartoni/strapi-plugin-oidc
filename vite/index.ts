import { join } from "node:path";
import type { Plugin } from "vite";

// __dirname: CJS global, available because this file is loaded via require()
// by Strapi's build pipeline (loadFile in @strapi/strapi core/files.js).
// dist/vite/ → ../../admin/src/ resolves to the shipped component source.
const componentPath = join(__dirname, "../../admin/src/OidcLoginPage.tsx");

/**
 * Intercepts Rollup's module resolution for every import and swaps
 * `@strapi/admin`'s AuthPage for OidcLoginPage.
 *
 * resolve.alias only fires on imports written in user code, it does not reach
 * relative imports that are internal to a node_modules package. A resolveId
 * hook is called for every import Rollup encounters, so it reliably intercepts
 * the `import { AuthPage } from './pages/Auth/AuthPage.mjs'` inside
 * `@strapi/admin`'s router.mjs.
 *
 * Pinned to `@strapi/admin` ^5.48.0, re-verify on upgrade.
 */
export const oidcAuthPagePlugin: Plugin = {
  name: "strapi-plugin-oidc:oidc-auth-page",
  // Must run before Vite's node-resolve plugin; without enforce: 'pre',
  // node-resolve returns the absolute path first and our hook is never called.
  enforce: "pre",
  resolveId(id) {
    if (/\/pages\/Auth\/AuthPage(\.[mc]?js)?$/.test(id)) {
      return componentPath;
    }
    return null;
  },
};
