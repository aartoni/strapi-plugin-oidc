import { Core } from "@strapi/strapi";

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const actions = [
    {
      section: "plugins",
      displayName: "Read",
      uid: "read",
      pluginName: "strapi-plugin-oidc",
    },
  ];
  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
