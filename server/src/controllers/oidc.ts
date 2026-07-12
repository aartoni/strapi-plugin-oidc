import { Context } from "koa";
import { getJson, postForm } from "../utils/http";
import { randomUUID, randomBytes } from "node:crypto";
import pkceChallenge from "pkce-challenge";
import { Config } from "../utils/config";

export const REQUIRED_OIDC_FIELDS: (keyof Config)[] = [
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
  const config = strapi.config.get<Config>("plugin::oidc");
  const missing = REQUIRED_OIDC_FIELDS.filter((key) => !config?.[key]);
  if (missing.length > 0) {
    throw new Error(`These are required: ${missing.join(", ")}.`);
  }
  return config;
};

const oidcSignIn = async (ctx: Context) => {
  let state = ctx.query.state as string;
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

  ctx.redirect(`${OIDC_AUTHORIZATION_ENDPOINT}?${params.toString()}`);
};

const oidcSignInCallback = async (ctx: Context) => {
  const config = configValidation();
  const userService = strapi.service("admin::user");
  const oauthService = strapi.plugin("oidc").service("oauth");
  const roleService = strapi.plugin("oidc").service("role");

  if (!ctx.query.code) {
    ctx.body = oauthService.renderSignUpError("sso_no_code");
    return;
  }
  if (!ctx.query.state || ctx.query.state !== ctx.session.oidcState) {
    ctx.body = oauthService.renderSignUpError("sso_invalid_state");
    return;
  }

  const params = new URLSearchParams();
  params.append("code", ctx.query.code as string);
  params.append("client_id", config["OIDC_CLIENT_ID"]);
  params.append("client_secret", config["OIDC_CLIENT_SECRET"]);
  params.append("redirect_uri", config["OIDC_REDIRECT_URI"]);
  params.append("grant_type", config["OIDC_GRANT_TYPE"]);

  // Include the code verifier from the session
  params.append("code_verifier", ctx.session.codeVerifier);

  try {
    const response = await postForm<OidcTokenResponse>(
      config["OIDC_TOKEN_ENDPOINT"],
      params,
    );

    const userResponse = await getJson<OidcUserInfo>(
      config["OIDC_USER_INFO_ENDPOINT"],
      { Authorization: `Bearer ${response.access_token}` },
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
        ctx.body = oauthService.renderSignUpError("sso_access_denied");
        return;
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
    const html = oauthService.renderSignUpSuccess(jwtToken, nonce);
    ctx.set("Content-Security-Policy", `script-src 'nonce-${nonce}'`);
    ctx.body = html;
  } catch (e) {
    strapi.log.error(e);
    ctx.body = oauthService.renderSignUpError("sso_failed.");
    return;
  }
};

export default {
  oidcSignIn,
  oidcSignInCallback,
};
