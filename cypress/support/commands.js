/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

const AUTHELIA_STACK = {
  cms: "https://cms.strapi.local",
  idp: "https://auth.strapi.local",
};

// Generic OIDC login for any Authelia user. Uses the username as session key
// so sessions for different users don't collide.
Cypress.Commands.add("loginAs", (username, password) => {
  cy.session(
    `oidc-${username}`,
    () => {
      // The OIDC endpoint 302s to Authelia, which would make Authelia the top
      // origin *before* cy.origin is called. Visiting from within cy.origin
      // lets Cypress handle the redirect inside that context instead.
      cy.origin(
        AUTHELIA_STACK.idp,
        { args: { cms: AUTHELIA_STACK.cms, username, password } },
        ({ cms, username, password }) => {
          cy.visit(`${cms}/api/strapi-plugin-oidc/sign-in`);
          cy.get("#username-textfield").type(username);
          cy.get("#password-textfield").type(password);
          cy.get("#sign-in-button").click();
        },
      );

      // After Authelia's redirect back to cms.strapi.local/callback the plugin
      // sets localStorage and redirects to /admin.
      cy.url().should("include", "/admin");
      cy.window()
        .its("localStorage")
        .invoke("getItem", "isLoggedIn")
        .should("eq", "true");
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        cy.visit(`${AUTHELIA_STACK.cms}/admin`);
        cy.url().should("not.include", "/auth/");
      },
    },
  );
});

// Convenience wrapper, logs in as the default super-admin test user.
Cypress.Commands.add("login", () => cy.loginAs("john", "password"));
