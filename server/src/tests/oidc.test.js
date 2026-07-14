import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import dotenv from "dotenv";
import process from "node:process";
import request from "supertest";
import nock from "nock";
import { setupStrapi, stopStrapi } from "../../../playground/tests/helpers";

dotenv.config({ path: "playground/.env" });

// Mocked "verified" id_token payload. Carries the claims the callback may
// re-check after jwtVerify returns.
const mockPayload = {
  sub: "test-user",
  nonce: "placeholder",
  iss: "https://auth.example.com",
  aud: process.env.OIDC_CLIENT_ID,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

jest.mock("jose", () => ({
  jwtVerify: () => Promise.resolve({ payload: mockPayload }),
  createRemoteJWKSet: () => () => {},
}));

let strapi;

beforeAll(async () => {
  strapi = await setupStrapi();
});

afterAll(async () => {
  await stopStrapi();
  nock.cleanAll();
});

describe("OIDC sign in", () => {
  it("should redirect with 302 and set session values", async () => {
    const res = await request(strapi.server.httpServer).get(
      "/api/oidc/sign-in",
    );

    expect(res.status).toBe(302);
    expect(res.headers["location"]).toMatch(
      /^https:\/\/auth\.example\.com\/authorize/,
    );
    const url = new URL(res.headers["location"]);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe(process.env.OIDC_CLIENT_ID);
    expect(url.searchParams.get("code_challenge")).toBeDefined();
    expect(url.searchParams.get("code_challenge_method")).toBeDefined();
    expect(url.searchParams.get("state")).toBeDefined();
    expect(url.searchParams.get("redirect_uri")).toBe(
      process.env.OIDC_REDIRECT_URI,
    );
    expect(url.searchParams.get("scope")).toBe(process.env.OIDC_SCOPES);
  });

  it("logs the user in and returns success HTML", async () => {
    const agent = request.agent(strapi.server.httpServer);

    // Start the flow (keeps the session cookie)
    const authStart = await agent.get("/api/oidc/sign-in").expect(302);
    const redirectUrl = new URL(authStart.headers.location);
    const state = redirectUrl.searchParams.get("state");
    const nonce = redirectUrl.searchParams.get("nonce");

    // The verified id_token nonce must match the one bound to the session
    expect(nonce).toBeTruthy();
    mockPayload.nonce = nonce;

    // Mock token and userinfo endpoints
    nock(process.env.OIDC_TOKEN_ENDPOINT)
      .post(/.*/)
      .reply(200, { access_token: "ACCESS", id_token: "IDTOKEN" });

    nock(process.env.OIDC_USER_INFO_ENDPOINT)
      .get(/.*/)
      .reply(200, {
        sub: "test-user", // must equal the id_token sub
        email: "jane.doe@example.com",
        [process.env.OIDC_FAMILY_NAME_FIELD]: "Doe",
        [process.env.OIDC_GIVEN_NAME_FIELD]: "Jane",
        groups: ["admins"],
      });

    // Hit the callback
    const res = await agent.get(
      `/api/oidc/callback?code=FAKE_CODE&state=${state}`,
    );

    // Sanity checks
    expect(res.status).toBe(200);
    expect(res.type).toBe("text/html");
    expect(res.text).toMatch(/<script nonce=/);

    // Inline script nonce matches the CSP header nonce
    const scriptMatch = res.text.match(
      /<script nonce="([^"]+)">([\s\S]*?)<\/script>/,
    );
    expect(scriptMatch).not.toBeNull();
    const [, nonceAttr, scriptText] = scriptMatch;
    const nonceHeader =
      res.headers["content-security-policy"].match(/nonce-([^']+)/)[1];
    expect(nonceAttr).toBe(nonceHeader);

    // A well-formed JWT is handed to the admin panel
    const jwtMatch = scriptText.match(
      /localStorage\.setItem\('jwtToken', '"([^"]+)"'\)/,
    );
    expect(jwtMatch).not.toBeNull();
    const token = jwtMatch[1];
    expect(token.split(".")).toHaveLength(3);

    // The issued token authenticates as the mapped user
    const me = await agent
      .get("/admin/users/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(me.body.data.email).toBe("jane.doe@example.com");
  });
});
