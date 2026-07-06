# strapi-plugin-oidc

Single sign-on for Strapi 5! Log in to the administration screen using an OpenID Connect (OIDC) provider.

Optionally overwrites Strapi's default admin login page and endpoints.

## Installation

```sh
yarn add strapi-plugin-oidc
```

or

```sh
npm i strapi-plugin-oidc
```

## Configuration

Just put the following in your `config/plugins.ts`.

```ts
export default ({ env }) => ({
  "strapi-plugin-oidc": {
    enabled: true,
    config: {
      // Either sets token to session storage if false or local storage if true
      REMEMBER_ME: false,

      // OpenID Connect
      OIDC_REDIRECT_URI: "https://your-strapi/api/strapi-plugin-oidc/callback",
      OIDC_CLIENT_ID: "[Client ID from the provider]",
      OIDC_CLIENT_SECRET: "[Client secret from the provider]",
      OIDC_AUTHORIZATION_ENDPOINT: "[API Endpoint]",
      OIDC_TOKEN_ENDPOINT: "[API Endpoint]",
      OIDC_USER_INFO_ENDPOINT: "[API Endpoint]",
      OIDC_SCOPES: "openid profile email groups",

      // Optional grant type customization
      OIDC_GRANT_TYPE: "authorization_code",

      // Optional customization for username arguments
      OIDC_FAMILY_NAME_FIELD: "family_name",
      OIDC_GIVEN_NAME_FIELD: "given_name",
    }
  }
})
```

### Optional routing

> Warning: this section is not complete yet.

To overwrite Strapi's default admin login page, you'll have to add an explicit Vite configuration and import the provided plugin.

```ts
import { oidcAuthPagePlugin } from 'strapi-plugin-oidc/vite';
import { mergeConfig } from 'vite';

export default (config) =>
  mergeConfig(config, { plugins: [oidcAuthPagePlugin()] });
```

However, this is not enough to guarantee that your Strapi users won't try to login via API. To address that concern, you should load the provided middleware in your `config/middlewares.ts`.

```ts
// Default Strapi middleware stack, plus the native-auth blocker.
export default [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  // ...
  "plugin::strapi-plugin-oidc.block-native-auth",
];
```

## OIDC provider

See the [Docker compose file](compose.yml) for an example of how to set-up Authelia as an OIDC provider.

Commercial providers might ship OIDC support, including:
- [Google Identity Platform](https://docs.cloud.google.com/identity-platform/docs/web/oidc)
- [Amazon Cognito](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-oidc-idp.html)
- [Microsoft Entra](https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc)

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md).
