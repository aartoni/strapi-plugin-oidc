# @aartoni/strapi-plugin-oidc

Single sign-on for Strapi 5! Log in to the administration screen using an OpenID Connect (OIDC) provider.

Optionally overwrites Strapi's default admin login page and endpoints.

## Installation

```sh
yarn add @aartoni/strapi-plugin-oidc
```

or

```sh
npm i @aartoni/strapi-plugin-oidc
```

## Configuration

Just put the following in your `config/plugins.ts`.

```ts
export default ({ env }) => ({
  "oidc": {
    enabled: true,
    config: {
      // Either sets token to session storage if false or local storage if true
      rememberMe: false,

      // OpenID Connect
      redirectUri: "https://your-strapi/api/oidc/callback",
      clientId: "[Client ID from the provider]",
      clientSecret: "[Client secret from the provider]",
      authorizationEndpoint: "[API Endpoint]",
      tokenEndpoint: "[API Endpoint]",
      userInfoEndpoint: "[API Endpoint]",
      scopes: "openid profile email groups",

      // Optional grant type customization
      grantType: "authorization_code",

      // Optional customization for username arguments
      familyNameField: "family_name",
      givenNameField: "given_name",
    }
  }
})
```

### Optional routing

> Warning: this section is not complete yet.

To overwrite Strapi's default admin login page, you'll have to add an explicit Vite configuration and import the provided plugin.

```ts
import { oidcAuthPagePlugin } from '@aartoni/strapi-plugin-oidc/vite';
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
  "plugin::oidc.block-native-auth",
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
