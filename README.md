<div align="center">
 <img src="https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/strapi-plugin-sso.png?raw=true" width="180"/>
</div>

# Strapi plugin strapi-plugin-sso

This plugin can provide single sign-on.

You will be able to log in to the administration screen using an OpenID Connect
(OIDC) provider.

Please read the [documents](#user-content-documentationenglish) for some precautions.

**If possible, consider using the Gold Plan features.**

## Version

| NodeJS          | Strapi | strapi-plugin-sso |
|-----------------|--------|-------------------|
| 16.0.0 - 21.0.0 | v4     | 0.\*.\*           |
| 18.0.0 - 24.0.0 | v5     | 1.\*.\*           |

Please use version 1.0.7 or later when working with Strapi 5.24.1 or above.

## Easy to install

```shell
yarn add strapi-plugin-sso
```

or

```shell
npm i strapi-plugin-sso
```

## Requirements

- **strapi-plugin-sso**
- An OpenID Connect (OIDC) provider

## Example Configuration

```javascript
// config/plugins.js
module.exports = ({env}) => ({
  'strapi-plugin-sso': {
    enabled: true,
    config: {
      // Either sets token to session storage if false or local storage if true
      REMEMBER_ME: false,

      // OpenID Connect
      OIDC_REDIRECT_URI: 'http://localhost:1337/strapi-plugin-sso/oidc/callback', // URI after successful login
      OIDC_CLIENT_ID: '[Client ID from OpenID Provider]',
      OIDC_CLIENT_SECRET: '[Client Secret from OpenID Provider]',

      OIDC_SCOPES: 'openid profile email', // https://oauth.net/2/scope/
      // API Endpoints required for OIDC
      OIDC_AUTHORIZATION_ENDPOINT: '[API Endpoint]',
      OIDC_TOKEN_ENDPOINT: '[API Endpoint]',
      OIDC_USER_INFO_ENDPOINT: '[API Endpoint]',
      OIDC_USER_INFO_ENDPOINT_WITH_AUTH_HEADER: false,
      OIDC_GRANT_TYPE: 'authorization_code', // https://oauth.net/2/grant-types/
      // customizable username arguments
      OIDC_FAMILY_NAME_FIELD: 'family_name',
      OIDC_GIVEN_NAME_FIELD: 'given_name',

      USE_WHITELIST: true // allow authentication only at the specified email address.
    }
  }
})
```

All OIDC endpoints and credentials above are required; `REMEMBER_ME` and `USE_WHITELIST` are optional.

## Documentation(English)

[OIDC Single Sign On Setup](https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/en/oidc/setup.md)

[whitelist](https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/whitelist.md)

## Documentation(Japanese)

[Description](https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/README.md)

## Demo

![Demo](https://github.com/yasudacloud/strapi-plugin-sso/blob/main/docs/demo.gif?raw=true "DemoMovie")

## Testing the plugin

Install node modules in the plugin and the playground.

```sh
yarn install && yarn playground:install
```

Build the plugin and the playground.

```sh
yarn build && yarn playground:build
```

Run the tests.

```sh
yarn test:jest
```
