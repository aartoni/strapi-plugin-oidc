/// <reference types="cypress" />

const CMS = "https://cms.strapi.local";

describe("SSO plugin", () => {
  describe("OIDC sign-in", () => {
    beforeEach(() => {
      cy.login();
      cy.visit(`${CMS}/admin`);
    });

    it("provisions john.doe@example.org and lands in the admin", () => {
      cy.url().should("include", "/admin");
      cy.window()
        .its("localStorage")
        .invoke("getItem", "isLoggedIn")
        .should("eq", "true");

      // Confirm the session belongs to the OIDC-provisioned user
      cy.getCookie("jwtToken")
        .should("exist")
        .then((cookie) => {
          cy.request({
            url: "/admin/users/me",
            headers: {
              Authorization: `Bearer ${decodeURIComponent(cookie.value)}`,
            },
          })
            .its("body.data.email")
            .should("eq", "john.doe@example.org");
        });
    });
  });

  describe("role mapping by group", () => {
    beforeEach(() => {
      cy.loginAs("jane", "password");
      cy.visit(`${CMS}/admin`);
    });

    it("assigns the Editor role to jane.editor@example.org via the editors group", () => {
      cy.getCookie("jwtToken")
        .should("exist")
        .then((cookie) => {
          cy.request({
            url: "/admin/users/me",
            headers: {
              Authorization: `Bearer ${decodeURIComponent(cookie.value)}`,
            },
          }).then((res) => {
            expect(res.body.data.email).to.eq("jane.editor@example.org");
            expect(res.body.data.roles.map((r) => r.code)).to.include(
              "strapi-editor",
            );
          });
        });
    });
  });

  describe("error rendering", () => {
    it("shows the error page when callback is missing the auth code", () => {
      cy.visit(`${CMS}/api/strapi-plugin-sso/oidc/callback`, {
        failOnStatusCode: false,
      });
      cy.contains("Authentication failed").should("be.visible");
      cy.get('meta[http-equiv="refresh"]').should("exist");
    });
  });

  describe("settings page", () => {
    beforeEach(() => {
      cy.login();

      cy.intercept("GET", "/api/strapi-plugin-sso/sso-roles", {
        fixture: "sso-roles.json",
      }).as("getSSORoles");

      cy.visit(`${CMS}/admin/plugins/strapi-plugin-sso`);
      cy.wait("@getSSORoles");
    });

    it("renders the role attribute path field", () => {
      cy.findByRole("heading", { name: /single sign on/i }).should("exist");
      cy.contains(
        /assign strapi roles to users based on their oidc claims/i,
      ).should("be.visible");
      cy.findByRole("textbox").should("exist");
      cy.findByRole("button", { name: /save/i }).should("be.visible");
    });
  });
});
