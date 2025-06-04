require('dotenv').config({ path: 'playground/.env' });
const request = require('supertest');
const nock = require('nock');
const { setupStrapi, stopStrapi } = require('../../playground/tests/helpers');

let strapi;

beforeAll(async () => {
  strapi = await setupStrapi();
});

afterAll(async () => {
  await stopStrapi();
    nock.cleanAll();
});

describe('OIDC sign in', () => {
  it('should redirect with 302 and set session values', async () => {
    const res = await request(strapi.server.httpServer).get('/api/strapi-plugin-sso/oidc');

    expect(res.status).toBe(302);
    expect(res.headers['location']).toMatch(/^https:\/\/auth.example.com\/authorize/);
    const url = new URL(res.headers['location']);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe(process.env.OIDC_CLIENT_ID);
    expect(url.searchParams.get('code_challenge')).toBeDefined();
    expect(url.searchParams.get('code_challenge_method')).toBeDefined();
    expect(url.searchParams.get('state')).toBeDefined();
    expect(url.searchParams.get('redirect_uri')).toBe(process.env.OIDC_REDIRECT_URI);
    expect(url.searchParams.get('scope')).toBe(process.env.OIDC_SCOPES);
  });

  it('logs the user in and returns success HTML', async () => {
    const agent = request.agent(strapi.server.httpServer);

    // Start the authentication flow (keeps the session cookie)
    const authStart = await agent.get('/api/strapi-plugin-sso/oidc').expect(302);
    const redirectUrl = new URL(authStart.headers.location);
    const state = redirectUrl.searchParams.get('state');

    // Mock token and user-info endpoints
    nock(process.env.OIDC_TOKEN_ENDPOINT)
      .post(/.*/)
      .reply(200, { access_token: 'ACCESS', id_token: 'IDTOKEN' });

    nock(process.env.OIDC_USER_INFO_ENDPOINT)
      .get(/.*/)
      .reply(200, {
        email: 'jane.doe@example.com',
        [process.env.OIDC_FAMILY_NAME_FIELD]: 'Doe',
        [process.env.OIDC_GIVEN_NAME_FIELD]: 'Jane',
      });

    // Hit the callback
    const res = await agent
      .get(
        `/api/strapi-plugin-sso/oidc/callback?code=FAKE_CODE&state=${state}`
      )
      
    // Sanity checks
    expect(res.status).toBe(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toMatch(/<script nonce=/);

    // Content matches
    const scriptMatch = res.text.match(/<script nonce="([^"]+)">([\s\S]*?)<\/script>/);
    expect(scriptMatch).not.toBeNull();
    const [ , nonceAttr, scriptText ] = scriptMatch;
    const nonceHeader = res.headers['content-security-policy'].match(/nonce-([^']+)/)[1];
    expect(nonceAttr).toBe(nonceHeader);
    const jwtMatch = res.text.match(/localStorage\.setItem\('jwtToken', '"([^"]+)"'\)/);
    expect(jwtMatch).not.toBeNull();
    const token = jwtMatch[1];
    expect(token.split('.')).toHaveLength(3);
    expect(scriptText).toContain("isLoggedIn");
  });
});
