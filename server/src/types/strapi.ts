import { Data } from "@strapi/strapi";

export type AdminUser = Data.ContentType<"admin::user">;

export type AdminSessionsConfig = {
  accessTokenLifespan?: number;
  maxRefreshTokenLifespan?: number;
  idleRefreshTokenLifespan?: number;
  maxSessionLifespan?: number;
  idleSessionLifespan?: number;
};
