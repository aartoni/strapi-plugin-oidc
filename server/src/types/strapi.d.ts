export type AdminSessionsConfig = {
  accessTokenLifespan?: number;
  maxRefreshTokenLifespan?: number;
  idleRefreshTokenLifespan?: number;
  maxSessionLifespan?: number;
  idleSessionLifespan?: number;
};

export type AdminUser = {
  id: string | number;
  password?: string;
  [key: string]: string | boolean | null | { id: number }[];
};
