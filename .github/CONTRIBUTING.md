# Contributing

Before contributing any feature, we'd appreciate it if you'd set up a testing environment.

## Testing

Install node modules, build the plugin, then link it into the playground.

```sh
yarn install
yarn build
yarn playground:install
yarn playground:build
```

Run the tests.

```sh
yarn test:jest
```

## E2E Testing

There's a Docker compose set-up that can be started with the provided script.

```sh
yarn e2e:services:up
```

And a Cypress test suite that is similarly easy to run.

```sh
yarn test:cypress
```

Optionally tear down the compose set-up.

```sh
yarn e2e:services:down
```
