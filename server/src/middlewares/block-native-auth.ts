import type { Context, Next } from "koa";

/**
 * Blocks the native Strapi credential-entry endpoints so local passwords
 * cannot be used to authenticate even by hitting the API directly.
 *
 * Endpoints left working: /admin/init, /admin/renew-token, /admin/logout,
 * and everything under /api/oidc/**.
 */
const BLOCKED_PATHS = new Set([
  "/admin/login",
  "/admin/register",
  "/admin/register-admin",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

export default () => async (ctx: Context, next: Next) => {
  if (ctx.method === "POST" && BLOCKED_PATHS.has(ctx.path)) {
    ctx.status = 403;
    return;
  }
  await next();
};
