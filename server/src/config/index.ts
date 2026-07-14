import { Config, REQUIRED_OIDC_FIELDS } from "../utils/config";

export default {
  default: {
    rememberMe: false,
    scopes: "openid profile email groups",
    grantType: "authorization_code",
    familyNameField: "family_name",
    givenNameField: "given_name",
  } as Config,
  validator(config: Config) {
    const missing = REQUIRED_OIDC_FIELDS.filter((key) => !config[key]);
    if (missing.length > 0) {
      throw new Error(`These are required: ${missing.join(", ")}.`);
    }

    const scopes = config.scopes.split(/\s+/);
    if (!scopes.includes("openid")) {
      throw new Error("The 'openid' scope is required.");
    }
  },
};
