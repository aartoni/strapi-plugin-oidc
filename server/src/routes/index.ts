export default {
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "GET",
        path: "/sso-roles",
        handler: "role.find",
        config: { auth: false },
      },
      {
        method: "PUT",
        path: "/sso-roles",
        handler: "role.update",
        config: { auth: false },
      },
      {
        method: "GET",
        path: "/sign-in",
        handler: "oidc.oidcSignIn",
        config: {
          auth: false,
        },
      },
      {
        method: "GET",
        path: "/callback",
        handler: "oidc.oidcSignInCallback",
        config: {
          auth: false,
        },
      },
    ],
  },
};
