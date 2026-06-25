import { describe, test, expect, jest } from "@jest/globals";
import accepts from "accepts";
import oauth from "../oauth";

const ctxFor = (acceptLanguage) => {
  const headers = { "accept-language": acceptLanguage };
  const negotiator = accepts({ headers });
  return { acceptsLanguages: (...langs) => negotiator.languages(...langs) };
};

describe("oauth service", () => {
  const strapi = jest.fn();
  const service = oauth({ strapi });

  describe("localeFindByHeader", () => {
    test.each([
      ["fr", "fr"],
      ["en", "en"],
      ["fr,en;q=0.8", "fr"],
      ["en-US,en;q=0.9", "en"],
      ["ja", "en"],
      [undefined, "en"],
    ])("Accept-Language %p → %p", (header, expected) => {
      expect(service.localeFindByHeader(ctxFor(header))).toBe(expected);
    });
  });
});
