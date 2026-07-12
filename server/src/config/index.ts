import { Config } from "src/utils/config";

export default {
  default: {
    REMEMBER_ME: false,

    OIDC_REDIRECT_URI: "http://localhost:1337/api/oidc/callback",
    OIDC_CLIENT_ID: "",
    OIDC_CLIENT_SECRET: "",
    OIDC_SCOPES: "openid profile email groups",
    OIDC_AUTHORIZATION_ENDPOINT: "",
    OIDC_TOKEN_ENDPOINT: "",
    OIDC_USER_INFO_ENDPOINT: "",
    OIDC_GRANT_TYPE: "authorization_code",
    OIDC_FAMILY_NAME_FIELD: "family_name",
    OIDC_GIVEN_NAME_FIELD: "given_name",
  } as Config,
  validator() {},
};
