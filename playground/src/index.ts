/**
 * Playground app bootstrap — seeds the role attribute path expression on a
 * fresh DB so Cypress and the Docker stack don't need manual setup.
 *
 * The seed is idempotent; it is safe to call on every startup.
 */

import { Core, Data } from "@strapi/strapi";

type Role = Data.ContentType<"admin::role">;

export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const existingMapping = await strapi.db
      .query("plugin::strapi-plugin-sso.roles")
      .findOne({});

    if (existingMapping) return;

    const superAdminRole: Role = await strapi.db
      .query("admin::role")
      .findOne({ where: { code: "strapi-super-admin" } });

    const editorRole: Role = await strapi.db
      .query("admin::role")
      .findOne({ where: { code: "strapi-editor" } });

    await strapi.db.query("plugin::strapi-plugin-sso.roles").create({
      data: {
        expression: `contains(groups[*], 'admins') && '${superAdminRole.name}' || contains(groups[*], 'editors') && '${editorRole.name}'`,
      },
    });
    strapi.log.info("[playground] seeded role attribute path expression");
  },
};
