import strapiUtils from "@strapi/utils";
import generator from "generate-password";
import { randomUUID } from "node:crypto";

export default ({ strapi }) => ({
  async createUser(email, lastname, firstname, locale, roles = []) {
    // If the email address contains uppercase letters, convert it to lowercase and retrieve it from the DB. If not, register a new email address with a lower-case email address.
    const userService = strapi.service("admin::user");
    const normalizedEmail = email.toLowerCase();
    const existing = await userService.findOneByEmail(normalizedEmail);
    if (existing) {
      return existing;
    }

    const resolvedFirstName = firstname || email.split("@")[0];
    const createdUser = await userService.create({
      firstname: resolvedFirstName,
      lastname: lastname ?? "",
      email: email.toLocaleLowerCase(),
      roles,
      preferedLanguage: locale,
    });

    return await userService.register({
      registrationToken: createdUser.registrationToken,
      userInfo: {
        firstname: resolvedFirstName,
        lastname: lastname ?? "",
        password: generator.generate({
          length: 43, // 256 bits (https://en.wikipedia.org/wiki/Password_strength#Random_passwords)
          numbers: true,
          lowercase: true,
          uppercase: true,
          exclude: '()+_-=}{[]|:;"/?.><,`~',
          strict: true,
        }),
      },
    });
  },
  localeFindByHeader(ctx) {
    return ctx.acceptsLanguages("en", "fr") || "en";
  },
  async triggerWebHook(user) {
    const eventHub = strapi.eventHub;
    if (!eventHub) return;

    const modelDef = strapi.getModel("admin::user");
    const sanitizedEntity =
      await await strapiUtils.sanitize.sanitizers.defaultSanitizeOutput(
        { schema: modelDef, getModel: (uid) => strapi.getModel(uid) },
        user,
      );

    eventHub.emit("entry.create", {
      model: modelDef.modelName,
      entry: sanitizedEntity,
    });
  },
  triggerSignInSuccess(user) {
    const { password, ...safeUser } = user;
    const eventHub = strapi.eventHub;
    eventHub.emit("admin.auth.success", {
      user: safeUser,
      provider: "strapi-plugin-sso",
    });
  },
  // Sign In Success
  renderSignUpSuccess(jwtToken, user, nonce) {
    // get REMEMBER_ME from config
    const config = strapi.config.get("plugin::strapi-plugin-sso");
    const REMEMBER_ME = config["REMEMBER_ME"];
    const isRememberMe = !!REMEMBER_ME;

    return `
<!doctype html>
<html>
<head>
<noscript>
<h3>JavaScript must be enabled for authentication</h3>
</noscript>
<script nonce="${nonce}">
 window.addEventListener('load', function() {
  if(${isRememberMe}){
    localStorage.setItem('jwtToken', '"${jwtToken}"');
  }else{
    document.cookie = 'jwtToken=${encodeURIComponent(jwtToken)}; Path=/';
  }
  localStorage.setItem('isLoggedIn', 'true');
  location.href = '${strapi.config.admin.url}'
 })
</script>
</head>
<body>
</body>
</html>`;
  },
  // Sign In Error
  renderSignUpError(message) {
    return `
<!doctype html>
<html>
<head></head>
<body>
<h3>Authentication failed</h3>
<p>${message}</p>
</body>
</html>`;
  },
  async generateToken(user, ctx) {
    const sessionManager = strapi.sessionManager;
    if (!sessionManager) {
      throw new Error(
        "sessionManager is not supported. Please upgrade to Strapi v5.24.1 or later.",
      );
    }
    const userId = String(user.id);
    // TODO: A deviceId is generated each time you log in.
    const deviceId = randomUUID();

    const config = strapi.config.get("plugin::strapi-plugin-sso");
    const REMEMBER_ME = config["REMEMBER_ME"];
    const rememberMe = !!REMEMBER_ME;

    const { token: refreshToken } = await sessionManager(
      "admin",
    ).generateRefreshToken(userId, deviceId, {
      type: rememberMe ? "refresh" : "session",
    });

    const sessions = strapi.config.get("admin.auth.sessions", {});
    const maxRefresh = sessions.maxRefreshTokenLifespan;
    const cookieOptions = {
      sameSite: "lax",
      ...strapi.config.get("admin.auth.cookie", {}),
      ...(rememberMe && Number.isFinite(maxRefresh)
        ? { maxAge: maxRefresh * 1000 }
        : {}),
    };
    ctx.cookies.set("strapi_admin_refresh", refreshToken, cookieOptions);

    const accessResult =
      await sessionManager("admin").generateAccessToken(refreshToken);
    if ("error" in accessResult) {
      throw new Error(accessResult.error);
    }
    const { token: accessToken } = accessResult;
    return accessToken;
  },
});
