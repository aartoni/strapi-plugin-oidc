/// <reference types="cypress" />

const CMS = 'https://cms.strapi.local';

describe('SSO plugin', () => {
  describe('OIDC sign-in', () => {
    beforeEach(() => {
      cy.login();
      cy.visit(`${CMS}/admin`);
    });

    it('provisions john.doe@example.org and lands in the admin', () => {
      cy.url().should('include', '/admin');
      cy.window()
        .its('localStorage')
        .invoke('getItem', 'isLoggedIn')
        .should('eq', 'true');

      // Confirm the session belongs to the OIDC-provisioned user
      cy.getCookie('jwtToken')
        .should('exist')
        .then((cookie) => {
          cy.request({
            url: '/admin/users/me',
            headers: {
              Authorization: `Bearer ${decodeURIComponent(cookie.value)}`,
            },
          })
            .its('body.data.email')
            .should('eq', 'john.doe@example.org');
        });
    });
  });

  describe('settings page', () => {
    beforeEach(() => {
      cy.login();

      cy.intercept('GET', '/api/strapi-plugin-sso/sso-roles', { fixture: 'sso-roles.json' }).as('getSSORoles');
      cy.intercept('GET', '/admin/roles', { fixture: 'admin-roles.json' }).as('getRoles');
      cy.intercept('GET', '/api/strapi-plugin-sso/whitelist', { fixture: 'whitelist.json' }).as('getWhitelist');

      cy.visit(`${CMS}/admin/plugins/strapi-plugin-sso`);
      cy.wait(['@getSSORoles', '@getRoles', '@getWhitelist']);
    });

    it('renders header & default Roles tab', () => {
      cy.findByRole('heading', { name: /single sign on/i }).should('exist');
      cy.contains(/default role setting at first login/i).should('be.visible');

      cy.findByRole('tab', { name: /roles/i }).should('have.attr', 'aria-selected', 'true');
      cy.findByRole('tab', { name: /whitelist/i }).should('have.attr', 'aria-selected', 'false');

      cy.findByRole('button', { name: /save/i }).should('be.visible');
    });

    it('shows Whitelist disabled banner', () => {
      cy.findByRole('tab', { name: /whitelist/i }).click();
      cy.contains(/whitelist is currently disabled/i).should('be.visible');
    });
  });
});
