import { Core } from "@strapi/strapi";

export default ({ env }: Core.Config.Shared.ConfigParams) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
  },
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  rateLimit: {
    enabled: false,
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT"),
    },
  },
  flags: {
    nps: false,
    promoteEE: false,
  },
  watchIgnoreFiles: ["!**/.yalc/**/server/**"],
});
