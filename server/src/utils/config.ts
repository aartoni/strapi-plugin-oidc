export type Config = {
  OIDC_AUTHORIZATION_ENDPOINT: string;
  OIDC_TOKEN_ENDPOINT: string;
  OIDC_USER_INFO_ENDPOINT: string;
  OIDC_CLIENT_ID: string;
  OIDC_CLIENT_SECRET: string;
  OIDC_REDIRECT_URI: string;
  OIDC_SCOPES: string;
  OIDC_GRANT_TYPE: string;
  OIDC_FAMILY_NAME_FIELD: string;
  OIDC_GIVEN_NAME_FIELD: string;

  REMEMBER_ME?: boolean;
};
