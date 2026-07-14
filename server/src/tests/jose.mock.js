// Mapped as "jose" via moduleNameMapper so the SDK plugin's yalc-dist
// require("jose") resolves here instead of the real ESM-only jose.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mockPayload } = require("./oidc-flow.shared");

module.exports = {
  jwtVerify: () => Promise.resolve({ payload: mockPayload }),
  createRemoteJWKSet: () => () => {},
};
