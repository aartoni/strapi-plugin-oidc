import { describe, it, beforeAll, afterAll } from "@jest/globals";
import dotenv from "dotenv";
import request from "supertest";
import nock from "nock";
import { setupStrapi, stopStrapi } from "../../../playground/tests/helpers";
import {
  mockDiscovery,
  mockPayload,
  assertSignInRedirect,
  assertLoginFlow,
  DISCO_TOKEN_ENDPOINT,
  DISCO_USERINFO_ENDPOINT,
} from "./oidc-flow.shared";

dotenv.config({ path: "playground/.env" });

describe("OIDC sign in (discovery enabled)", () => {
  const endpoints = {
    tokenEndpoint: DISCO_TOKEN_ENDPOINT,
    userinfoEndpoint: DISCO_USERINFO_ENDPOINT,
  };
  let strapi;

  beforeAll(async () => {
    mockDiscovery(endpoints);
    strapi = await setupStrapi();
  });

  afterAll(async () => {
    await stopStrapi();
    nock.cleanAll();
  });

  it("redirects with 302 and sets session values", async () => {
    const agent = request.agent(strapi.server.httpServer);
    await assertSignInRedirect(agent);
  });

  it("logs the user in via discovered endpoints and returns success HTML", async () => {
    await assertLoginFlow(strapi, endpoints, mockPayload);
  });
});
