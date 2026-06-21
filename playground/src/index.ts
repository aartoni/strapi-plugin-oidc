/**
 * Playground app bootstrap — seeds two dev-only records on a fresh DB so
 * Cypress and the Docker stack don't need manual setup.
 *
 * Both seeds are idempotent; they are safe to call on every startup.
 * This file lives in the playground app — it is NOT part of the published plugin.
 *
 * TODO Would it make more sense to move these to the Docker / Cypress stack
 * actually?
 */

import { Core } from "@strapi/strapi";

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const superAdminRole = await strapi.db
      .query('admin::role')
      .findOne({ where: { code: 'strapi-super-admin' } });

    if (!superAdminRole) {
      strapi.log.warn('[playground] super-admin role not found — skipping seeds');
      return;
    }

    // Native super-admin
    // We seed this to avoid the infamous "Create your first admin" screen
    const adminCount = await strapi.db.query('admin::user').count();
    if (adminCount === 0) {
      await strapi.service('admin::user').create({
        firstname: 'Fake',
        lastname: 'Admin',
        email: 'fake@example.com',
        password: 'password',
        isActive: true,
        blocked: false,
        registrationToken: null,
        roles: [superAdminRole.id],
      });
      strapi.log.info('[playground] seeded native super-admin (fake@example.com)');
    }

    // Map every user coming from OIDC to the super-admin role
    const existingMapping = await strapi.db
      .query('plugin::strapi-plugin-sso.roles')
      .findOne({ where: { oauth_type: '4' } });

    if (!existingMapping) {
      await strapi.db.query('plugin::strapi-plugin-sso.roles').create({
        data: { oauth_type: '4', roles: [superAdminRole.id] },
      });
      strapi.log.info('[playground] seeded OIDC → super-admin role mapping');
    }
  },
};
