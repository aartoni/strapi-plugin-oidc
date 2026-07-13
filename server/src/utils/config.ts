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
