import { Config } from "../utils/config";

export default {
  default: {
    rememberMe: false,

    redirectUri: "http://localhost:1337/api/oidc/callback",
    clientId: "",
    clientSecret: "",
    scopes: "openid profile email groups",
    authorizationEndpoint: "",
    tokenEndpoint: "",
    userInfoEndpoint: "",
    grantType: "authorization_code",
    familyNameField: "family_name",
    givenNameField: "given_name",
  } as Config,
  validator() {},
};
