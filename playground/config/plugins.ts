import { readFileSync } from "node:fs";
import { Core } from "@strapi/strapi";

const fromFile = (filePath: string | undefined) => {
  if (!filePath) return undefined;
  return readFileSync(filePath, "utf8").trim();
};

export default ({ env }: Core.Config.Shared.ConfigParams) => ({
  oidc: {
    enabled: true,
    config: {
      REMEMBER_ME: false,
      OIDC_REDIRECT_URI: env("OIDC_REDIRECT_URI"),
      OIDC_CLIENT_ID: fromFile(env("OIDC_CLIENT_ID_FILE")),
      OIDC_CLIENT_SECRET: fromFile(env("OIDC_CLIENT_SECRET_FILE")),
      OIDC_AUTHORIZATION_ENDPOINT: env("OIDC_AUTHORIZATION_ENDPOINT"),
      OIDC_TOKEN_ENDPOINT: env("OIDC_TOKEN_ENDPOINT"),
      OIDC_USER_INFO_ENDPOINT: env("OIDC_USER_INFO_ENDPOINT"),
      OIDC_SCOPES: env("OIDC_SCOPES"),
    },
  },
});
