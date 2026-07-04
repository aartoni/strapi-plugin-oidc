import path from "node:path";
import { defineConfig, mergeConfig, type Plugin, type UserConfig } from "vite";

/**
 * Replaces @strapi/admin's AuthPage with OidcLoginPage at build time.
 *
 * The admin router (router.mjs) imports AuthPage as a relative ESM module:
 *   import { AuthPage } from './pages/Auth/AuthPage.mjs'
 *
 * resolve.alias only intercepts imports written in user code; relative imports
 * internal to a node_modules package are already resolved by Vite's node-resolve
 * plugin before aliases are consulted. A resolveId hook with enforce: 'pre'
 * fires before node-resolve and can intercept any import, including
 * package-internal ones.
 *
 * Pinned to @strapi/admin ^5.48.0 — re-verify the module path on upgrade.
 */
const oidcAuthPagePlugin = (): Plugin => ({
  name: "oidc-auth-page",
  // Must run before Vite's node-resolve plugin; without enforce: 'pre',
  // node-resolve returns the absolute path first and our hook is never called.
  enforce: "pre",
  resolveId(id) {
    if (/\/pages\/Auth\/AuthPage(\.[mc]?js)?$/.test(id)) {
      return path.resolve(__dirname, "OidcLoginPage.tsx");
    }
    return null;
  },
});

export default (config: UserConfig) =>
  mergeConfig(
    config,
    defineConfig({
      plugins: [oidcAuthPagePlugin()],
    }),
  );
