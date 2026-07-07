// Default Strapi middleware stack, plus the native-auth blocker.
// If this file is absent, Strapi uses the same defaults without the last entry.
export default [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::session",
  "strapi::query",
  "strapi::body",
  "strapi::favicon",
  "strapi::public",
  "plugin::strapi-plugin-sso.block-native-auth",
];
