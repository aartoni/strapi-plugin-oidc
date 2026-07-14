export type Config = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  issuer: string;
  jwksUri: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
  grantType: string;
  familyNameField: string;
  givenNameField: string;

  rememberMe?: boolean;
};

export const REQUIRED_OIDC_FIELDS: (keyof Config)[] = [
  "authorizationEndpoint",
  "tokenEndpoint",
  "userInfoEndpoint",
  "issuer",
  "jwksUri",
  "clientId",
  "clientSecret",
  "redirectUri",
  "scopes",
];
