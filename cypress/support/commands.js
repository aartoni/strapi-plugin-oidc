/// <reference types="cypress" />
import '@testing-library/cypress/add-commands'

Cypress.Commands.add('login', (path) => {
  cy.visit('/');

  cy.intercept({
    method: 'GET',
    url: '/admin/users/me',
  }).as('sessionCheck');

  cy.intercept({
    method: 'GET',
    url: '/admin/init',
  }).as('adminInit');

  // Wait for the initial request to complete.
  cy.wait('@adminInit').its('response.statusCode').should('equal', 200);

  // Wait for the form to render.
  cy.wait(1000);

  cy.get('body').then(($body) => {
    // Login
    if ($body.text().includes('Log in to your Strapi account')) {
      cy.get('input[name="email"]').type('johndoe@example.com');
      cy.get('input[name="password"]').type('Abc12345678');
      cy.get('button[type="submit"]').click();
      cy.wait('@sessionCheck').its('response.statusCode').should('equal', 200);
    }
    // Register
    if ($body.text().includes('Credentials are only used to authenticate in Strapi')) {
      cy.get('input[name="firstname"]').type('John');
      cy.get('input[name="email"]').type('johndoe@example.com');
      cy.get('input[name="password"]').type('Abc12345678');
      cy.get('input[name="confirmPassword"]').type('Abc12345678');
      cy.get('button[type="submit"]').click();
      cy.wait('@sessionCheck').its('response.statusCode').should('equal', 200);
    }
  });
});

Cypress.Commands.add('navigateToAdminPage', (path) => {
  cy.get('a[href="/admin/plugins/sso"]').click();
});
