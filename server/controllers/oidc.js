import { getJson, postForm } from "../utils/http.js";
import { randomUUID, randomBytes } from "node:crypto";
import pkceChallenge from "pkce-challenge";

const REQUIRED_OIDC_FIELDS = [
  "OIDC_AUTHORIZATION_ENDPOINT",
  "OIDC_TOKEN_ENDPOINT",
  "OIDC_USER_INFO_ENDPOINT",
  "OIDC_CLIENT_ID",
  "OIDC_CLIENT_SECRET",
  "OIDC_REDIRECT_URI",
  "OIDC_SCOPES",
  "OIDC_GRANT_TYPE",
  "OIDC_FAMILY_NAME_FIELD",
  "OIDC_GIVEN_NAME_FIELD",
];

const configValidation = () => {
  const config = strapi.config.get("plugin::strapi-plugin-sso");
  const missing = REQUIRED_OIDC_FIELDS.filter((key) => !config?.[key]);
  if (missing.length > 0) {
    throw new Error(`These are required: ${missing.join(", ")}.`);
  }
  return config;
};

const oidcSignIn = async (ctx) => {
  let { state } = ctx.query;
  const {
    OIDC_CLIENT_ID,
    OIDC_REDIRECT_URI,
    OIDC_SCOPES,
    OIDC_AUTHORIZATION_ENDPOINT,
  } = configValidation();

  // Generate code verifier and code challenge
  const { code_verifier: codeVerifier, code_challenge: codeChallenge } =
    await pkceChallenge();

  // Store the code verifier in the session
  ctx.session.codeVerifier = codeVerifier;

  if (!state) {
    state = randomBytes(32).toString("base64url");
  }
  ctx.session.oidcState = state;

  const params = new URLSearchParams();
  params.append("response_type", "code");
  params.append("client_id", OIDC_CLIENT_ID);
  params.append("redirect_uri", OIDC_REDIRECT_URI);
  params.append("scope", OIDC_SCOPES);
  params.append("code_challenge", codeChallenge);
  params.append("code_challenge_method", "S256");
  params.append("state", state);
  const authorizationUrl = `${OIDC_AUTHORIZATION_ENDPOINT}?${params.toString()}`;
  ctx.set("Location", authorizationUrl);
  return ctx.send({}, 302);
};

const oidcSignInCallback = async (ctx) => {
  const config = configValidation();
  const userService = strapi.service("admin::user");
  const oauthService = strapi.plugin("strapi-plugin-sso").service("oauth");
  const roleService = strapi.plugin("strapi-plugin-sso").service("role");

  if (!ctx.query.code) {
    return ctx.send(oauthService.renderSignUpError(`code Not Found`));
  }
  if (!ctx.query.state || ctx.query.state !== ctx.session.oidcState) {
    return ctx.send(oauthService.renderSignUpError(`Invalid state`));
  }

  const params = new URLSearchParams();
  params.append("code", ctx.query.code);
  params.append("client_id", config["OIDC_CLIENT_ID"]);
  params.append("client_secret", config["OIDC_CLIENT_SECRET"]);
  params.append("redirect_uri", config["OIDC_REDIRECT_URI"]);
  params.append("grant_type", config["OIDC_GRANT_TYPE"]);

  // Include the code verifier from the session
  params.append("code_verifier", ctx.session.codeVerifier);

  try {
    const response = await postForm(config["OIDC_TOKEN_ENDPOINT"], params);

    let userInfoEndpointHeaders = {};
    let userInfoEndpointParameters = `?access_token=${response.access_token}`;

    if (config["OIDC_USER_INFO_ENDPOINT_WITH_AUTH_HEADER"]) {
      userInfoEndpointHeaders = {
        Authorization: `Bearer ${response.access_token}`,
      };
      userInfoEndpointParameters = "";
    }

    const userInfoEndpoint = `${config["OIDC_USER_INFO_ENDPOINT"]}${userInfoEndpointParameters}`;

    const userResponse = await getJson(
      userInfoEndpoint,
      userInfoEndpointHeaders,
    );

    const email = userResponse.email;

    const dbUser = await userService.findOneByEmail(email);
    let activateUser;
    let jwtToken;

    if (dbUser) {
      // Already registered
      activateUser = dbUser;
      jwtToken = await oauthService.generateToken(dbUser, ctx);
    } else {
      // Register a new account
      const roles = await roleService.resolveRole(userResponse);
      if (!roles) {
        return ctx.send(
          oauthService.renderSignUpError(
            "Your account has not been granted access. Please contact your administrator.",
          ),
        );
      }

      const defaultLocale = oauthService.localeFindByHeader(ctx);
      activateUser = await oauthService.createUser(
        email,
        userResponse[config["OIDC_FAMILY_NAME_FIELD"]],
        userResponse[config["OIDC_GIVEN_NAME_FIELD"]],
        defaultLocale,
        roles,
      );
      jwtToken = await oauthService.generateToken(activateUser, ctx);

      // Trigger webhook
      await oauthService.triggerWebHook(activateUser);
    }
    // Login Event Call
    oauthService.triggerSignInSuccess(activateUser);

    // Client-side authentication persistence and redirection
    const nonce = randomUUID();
    const html = oauthService.renderSignUpSuccess(
      jwtToken,
      activateUser,
      nonce,
    );
    ctx.set("Content-Security-Policy", `script-src 'nonce-${nonce}'`);
    ctx.send(html);
  } catch (e) {
    console.error(e);
    ctx.send(oauthService.renderSignUpError(e.message));
  }
};

export default {
  oidcSignIn,
  oidcSignInCallback,
};
