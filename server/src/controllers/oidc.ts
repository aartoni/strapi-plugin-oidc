import { Context } from "koa";
import { getJson, postForm } from "../utils/http";
import { randomUUID, randomBytes } from "node:crypto";
import pkceChallenge from "pkce-challenge";
import { Config } from "../utils/config";

export const REQUIRED_OIDC_FIELDS: (keyof Config)[] = [
  "authorizationEndpoint",
  "tokenEndpoint",
  "userInfoEndpoint",
  "clientId",
  "clientSecret",
  "redirectUri",
  "scopes",
  "grantType",
  "familyNameField",
  "givenNameField",
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
  const { clientId, redirectUri, scopes, authorizationEndpoint } =
    configValidation();

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
  params.append("client_id", clientId);
  params.append("redirect_uri", redirectUri);
  params.append("scope", scopes);
  params.append("code_challenge", codeChallenge);
  params.append("code_challenge_method", "S256");
  params.append("state", state);

  ctx.redirect(`${authorizationEndpoint}?${params.toString()}`);
};

const oidcSignInCallback = async (ctx: Context) => {
  const config = configValidation();
  const userService = strapi.service("admin::user");
  const oauthService = strapi.plugin("oidc").service("oauth");
  const roleService = strapi.plugin("oidc").service("role");

  // Read and clear one-time session values up front so they can't be reused
  const oidcState = ctx.session.oidcState;
  const codeVerifier = ctx.session.codeVerifier;
  delete ctx.session.oidcState;
  delete ctx.session.codeVerifier;

  if (!ctx.query.code) {
    ctx.body = oauthService.renderSignUpError("sso_no_code");
    return;
  }
  if (!ctx.query.state || ctx.query.state !== oidcState) {
    ctx.body = oauthService.renderSignUpError("sso_invalid_state");
    return;
  }

  const params = new URLSearchParams();
  params.append("code", ctx.query.code as string);
  params.append("client_id", config.clientId);
  params.append("client_secret", config.clientSecret);
  params.append("redirect_uri", config.redirectUri);
  params.append("grant_type", config.grantType);

  // Include the code verifier from the session
  params.append("code_verifier", codeVerifier);

  try {
    const response = await postForm<OidcTokenResponse>(
      config.tokenEndpoint,
      params,
    );

    const userResponse = await getJson<OidcUserInfo>(config.userInfoEndpoint, {
      Authorization: `Bearer ${response.access_token}`,
    });

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
        userResponse[config.familyNameField],
        userResponse[config.givenNameField],
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
