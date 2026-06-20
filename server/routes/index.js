export default {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/sso-roles',
        handler: 'role.find'
      },
      {
        method: 'PUT',
        path: '/sso-roles',
        handler: 'role.update'
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
      },
      {
        method: 'POST',
        path: '/whitelist',
        handler: 'whitelist.register'
      },
      {
        method: 'DELETE',
        path: '/whitelist/:id',
        handler: 'whitelist.removeEmail'
      }
    ]
  }
};
