/// <reference types="cypress" />
import '@testing-library/cypress/add-commands';

const AUTHELIA_STACK = {
  cms: 'https://cms.strapi.local',
  idp: 'https://auth.strapi.local',
};

// Authenticates as the Authelia user (john.doe@example.org) through the full
// OIDC redirect flow.
Cypress.Commands.add('login', () => {
  cy.session(
    'oidc-john',
    () => {
      // The OIDC endpoint 302s to Authelia, which would make Authelia the top
      // origin *before* cy.origin is called. Visiting from within cy.origin
      // lets Cypress handle the redirect inside that context instead.
      cy.origin(
        AUTHELIA_STACK.idp,
        { args: { cms: AUTHELIA_STACK.cms } },
        ({ cms }) => {
          cy.visit(`${cms}/api/strapi-plugin-sso/oidc`);
          cy.get('#username-textfield').type('john');
          cy.get('#password-textfield').type('password');
          cy.get('#sign-in-button').click();
        },
      );

      // After Authelia's redirect back to cms.strapi.local/callback the plugin
      // sets localStorage and redirects to /admin.
      cy.url().should('include', '/admin');
      cy.window()
        .its('localStorage')
        .invoke('getItem', 'isLoggedIn')
        .should('eq', 'true');
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        cy.visit(`${AUTHELIA_STACK.cms}/admin`);
        cy.url().should('not.include', '/auth/');
      },
    },
  );
});
