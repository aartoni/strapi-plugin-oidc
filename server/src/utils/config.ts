export type Config = {
  discovery: boolean;
  rememberMe?: boolean;

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
};

export const ALWAYS_REQUIRED_FIELDS: (keyof Config)[] = [
  "issuer",
  "clientId",
  "clientSecret",
  "redirectUri",
  "scopes",
];

// The four fields the discovery document supplies (jwks_uri + three endpoints).
// Required only when discovery is off; populated by bootstrap when on.
export const DISCOVERABLE_FIELDS = [
  "authorizationEndpoint",
  "tokenEndpoint",
  "userInfoEndpoint",
  "jwksUri",
] as const satisfies readonly (keyof Config)[];
