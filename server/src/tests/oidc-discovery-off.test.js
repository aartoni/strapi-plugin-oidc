import { describe, it, beforeAll, afterAll, expect } from "@jest/globals";
import dotenv from "dotenv";
import process from "node:process";
import request from "supertest";
import nock from "nock";
import { setupStrapi, stopStrapi } from "../../../playground/tests/helpers";
import {
  mockPayload,
  assertSignInRedirect,
  assertLoginFlow,
  ISSUER,
} from "./oidc-flow.shared";

dotenv.config({ path: "playground/.env" });

describe("OIDC sign in (discovery disabled)", () => {
  const endpoints = {
    tokenEndpoint: process.env.OIDC_TOKEN_ENDPOINT,
    userinfoEndpoint: process.env.OIDC_USER_INFO_ENDPOINT,
  };
  let strapi;

  beforeAll(async () => {
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await stopStrapi();
    nock.cleanAll();
  });

  it("never fetches the discovery document", async () => {
    const scope = nock(ISSUER)
      .get("/.well-known/openid-configuration")
      .reply(200, {});

    await assertLoginFlow(strapi, endpoints, mockPayload);

    expect(scope.isDone()).toBe(false);
  });

  it("redirects with 302 and sets session values", async () => {
    const agent = request.agent(strapi.server.httpServer);
    await assertSignInRedirect(agent);
  });
});
