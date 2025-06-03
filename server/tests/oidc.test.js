require('dotenv').config({ path: 'playground/.env' });
const request = require('supertest');
const { setupStrapi, stopStrapi } = require('../../playground/tests/helpers');

let strapi;

beforeAll(async () => {
  strapi = await setupStrapi();
});

afterAll(async () => {
  await stopStrapi();
});

describe('GET /oidc', () => {
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
});
