# strapi-plugin-oidc
[![npm version](https://img.shields.io/npm/v/@aartoni/strapi-plugin-oidc.svg)](https://www.npmjs.com/package/@aartoni/strapi-plugin-oidc)
[![license](https://img.shields.io/npm/l/@aartoni/strapi-plugin-oidc.svg)](./LICENSE)

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

With OIDC Discovery (recommended: the plugin auto-resolves endpoints from your provider):

```ts
export default ({ env }) => ({
  "oidc": {
    enabled: true,
    config: {
      issuer: "https://your-oidc-provider.com",
      clientId: "[Client ID from the provider]",
      clientSecret: "[Client secret from the provider]",
      redirectUri: "https://your-strapi/api/oidc/callback",
      scopes: "openid profile email groups",
    },
  },
});
```

Or [manually](#full-options), with discovery disabled.

### Full options

| Key | Required | Default | Description |
|---|---|---|---|
| `issuer` | yes | – | Provider issuer URL (used for discovery and id_token validation) |
| `discovery` | no | `true` | Enable OIDC Discovery (`/.well-known/openid-configuration`) |
| `clientId` | yes | – | OIDC client ID |
| `clientSecret` | yes | – | OIDC client secret |
| `redirectUri` | yes | – | Callback URL after login |
| `scopes` | no | `"openid profile email groups"` | Space-separated OIDC scopes |
| `authorizationEndpoint` | only if `discovery: false` | – | Provider authorization endpoint |
| `tokenEndpoint` | only if `discovery: false` | – | Provider token endpoint |
| `userInfoEndpoint` | only if `discovery: false` | – | Provider userinfo endpoint |
| `jwksUri` | only if `discovery: false` | – | Provider JWKS URI |
| `grantType` | no | `"authorization_code"` | OAuth grant type |
| `familyNameField` | no | `"family_name"` | Userinfo claim for last name |
| `givenNameField` | no | `"given_name"` | Userinfo claim for first name |
| `rememberMe` | no | `false` | Store JWT in localStorage (`true`) or cookie (`false`) |

### Optional routing

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
