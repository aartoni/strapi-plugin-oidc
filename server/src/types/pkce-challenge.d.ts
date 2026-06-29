// TODO Remove once this is done:
// https://github.com/strapi/strapi/issues/25861
declare module 'pkce-challenge' {
  export type PKCEChallengeMethod = 'S256' | 'plain';

  export interface PKCEChallenge {
    code_verifier: string;
    code_challenge: string;
    code_challenge_method: PKCEChallengeMethod;
  }

  export default function pkceChallenge(
    length?: number,
    method?: PKCEChallengeMethod,
  ): Promise<PKCEChallenge>;

  export function generateChallenge(
    codeVerifier: string,
    method?: PKCEChallengeMethod,
  ): Promise<string>;

  export function verifyChallenge(
    codeVerifier: string,
    expectedChallenge: string,
    method?: PKCEChallengeMethod,
  ): Promise<boolean>;
}
