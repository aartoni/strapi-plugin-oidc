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
      rememberMe: false,
      redirectUri: env("OIDC_REDIRECT_URI"),
      clientId: fromFile(env("OIDC_CLIENT_ID_FILE")) ?? env("OIDC_CLIENT_ID"),
      clientSecret:
        fromFile(env("OIDC_CLIENT_SECRET_FILE")) ?? env("OIDC_CLIENT_SECRET"),
      authorizationEndpoint: env("OIDC_AUTHORIZATION_ENDPOINT"),
      tokenEndpoint: env("OIDC_TOKEN_ENDPOINT"),
      userInfoEndpoint: env("OIDC_USER_INFO_ENDPOINT"),
      scopes: env("OIDC_SCOPES"),
    },
  },
});
