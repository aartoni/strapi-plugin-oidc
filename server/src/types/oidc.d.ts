type OidcTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  id_token?: string;
};

type OidcUserInfo = {
  email: string;
  [claim: string]: string | undefined;
};
