export default ({ env }) => ({
  'strapi-plugin-sso': {
    enabled: true,
    config: {
      REMEMBER_ME: false,
      OIDC_REDIRECT_URI: env('OIDC_REDIRECT_URI'),
      OIDC_CLIENT_ID: env('OIDC_CLIENT_ID'),
      OIDC_CLIENT_SECRET: env('OIDC_CLIENT_SECRET'),
      OIDC_AUTHORIZATION_ENDPOINT: env('OIDC_AUTHORIZATION_ENDPOINT'),
      OIDC_TOKEN_ENDPOINT: env('OIDC_TOKEN_ENDPOINT'),
      OIDC_USER_INFO_ENDPOINT: env('OIDC_USER_INFO_ENDPOINT'),
    },
  },
});
