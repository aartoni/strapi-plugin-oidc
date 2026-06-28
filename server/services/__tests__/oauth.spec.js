import { describe, test, expect } from "@jest/globals";
import accepts from "accepts";
import oauth, { SSO_ERROR_MESSAGES } from "../oauth";

const ctxFor = (acceptLanguage) => {
  const headers = { "accept-language": acceptLanguage };
  const negotiator = accepts({ headers });
  return { acceptsLanguages: (...langs) => negotiator.languages(...langs) };
};

const mockStrapi = {
  config: {
    admin: { url: "/admin" },
    get: (key) => {
      if (key === "plugin::strapi-plugin-sso") return { REMEMBER_ME: false };
      return {};
    },
  },
};

describe("oauth service", () => {
  const service = oauth({ strapi: mockStrapi });

  describe("renderSignUpError", () => {
    test.each(Object.entries(SSO_ERROR_MESSAGES))(
      'code "%s" renders the correct message',
      (code, message) => {
        expect(service.renderSignUpError(code)).toContain(message);
      },
    );

    test("includes auto-redirect and link back to the login page", () => {
      const html = service.renderSignUpError("sso_no_code");
      expect(html).toContain("/admin/auth/login");
      expect(html).toContain('http-equiv="refresh"');
    });
  });

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
