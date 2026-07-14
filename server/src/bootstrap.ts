import { Core } from "@strapi/strapi";
import { Config } from "./utils/config";
import { discoverEndpoints } from "./utils/discovery";

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const config = strapi.config.get<Config>("plugin::oidc");

  if (config.discovery) {
    try {
      const endpoints = await discoverEndpoints(config.issuer);
      strapi.config.set("plugin::oidc", { ...config, ...endpoints });
      strapi.log.info(`OIDC discovery succeeded for issuer "${config.issuer}"`);
    } catch (e) {
      throw new Error(
        `OIDC discovery failed for issuer "${config.issuer}": ${(e as Error).message}`,
        { cause: e },
      );
    }
  }

  const actions = [
    {
      section: "plugins",
      displayName: "Read",
      uid: "read",
      pluginName: "oidc",
    },
  ];
  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
