import {
  Config,
  ALWAYS_REQUIRED_FIELDS,
  DISCOVERABLE_FIELDS,
} from "../utils/config";

export default {
  default: {
    discovery: true,
    rememberMe: false,
    scopes: "openid profile email groups",
    grantType: "authorization_code",
    familyNameField: "family_name",
    givenNameField: "given_name",
  } as Config,
  validator(config: Config) {
    const required = config.discovery
      ? ALWAYS_REQUIRED_FIELDS
      : [...ALWAYS_REQUIRED_FIELDS, ...DISCOVERABLE_FIELDS];
    const missing = required.filter((key) => !config[key]);
    if (missing.length > 0) {
      throw new Error(`These are required: ${missing.join(", ")}.`);
    }

    const scopes = config.scopes.split(/\s+/);
    if (!scopes.includes("openid")) {
      throw new Error("The 'openid' scope is required.");
    }
  },
};
