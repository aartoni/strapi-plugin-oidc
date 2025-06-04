/// <reference types="cypress" />
describe('SSO plugin – settings page', () => {
  beforeEach(() => {
    // Log in and stub the three initial GET calls
    cy.login();

    cy.intercept('GET', '/strapi-plugin-sso/sso-roles', { fixture: 'sso-roles.json' }).as('getSSORoles');
    cy.intercept('GET', '/admin/roles', { fixture: 'admin-roles.json' }).as('getRoles');
    cy.intercept('GET', '/strapi-plugin-sso/whitelist', { fixture: 'whitelist.json' }).as('getWhitelist');

    // Visit the plugin route
    cy.visit('/admin/plugins/strapi-plugin-sso');

    // Wait until all three API calls resolve
    cy.wait(['@getSSORoles', '@getRoles', '@getWhitelist']);
  });

  it('renders header & default Roles tab', () => {
    // Page header
    cy.findByRole('heading', { name: /single sign on/i }).should('exist');
    cy.contains(/default role setting at first login/i).should('be.visible');

    // Tabs
    cy.findByRole('tab', { name: /roles/i }).should('have.attr', 'aria-selected', 'true');
    cy.findByRole('tab', { name: /whitelist/i }).should('have.attr', 'aria-selected', 'false');

    // Something from the Roles content (adjust selector to your Role component)
    cy.findByRole('button', { name: /save/i }).should('be.visible');
  });

  it('shows Whitelist disabled banner', () => {
    cy.findByRole('tab', { name: /whitelist/i }).click();
    cy.contains(/whitelist is currently disabled/i).should('be.visible');
  });
});
