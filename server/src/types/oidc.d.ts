type OidcTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  // Available since the "openid" scope is required (see: `configValidation`)
  id_token: string;
};

type OidcUserInfo = {
  email: string;
  [claim: string]: string | undefined;
};
