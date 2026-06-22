export default {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/sso-roles',
        handler: 'role.find',
        config: { auth: false },
      },
      {
        method: 'PUT',
        path: '/sso-roles',
        handler: 'role.update',
        config: { auth: false },
      },
      {
        method: 'GET',
        path: '/oidc',
        handler: 'oidc.oidcSignIn',
        config: {
          auth: false,
        },
      },
      {
        method: 'GET',
        path: '/oidc/callback',
        handler: 'oidc.oidcSignInCallback',
        config: {
          auth: false,
        },
      },
      {
        method: 'GET',
        path: '/whitelist',
        handler: 'whitelist.info',
        config: { auth: false },
      },
      {
        method: 'POST',
        path: '/whitelist',
        handler: 'whitelist.register',
        config: { auth: false },
      },
      {
        method: 'DELETE',
        path: '/whitelist/:id',
        handler: 'whitelist.removeEmail',
        config: { auth: false },
      }
    ]
  }
};
