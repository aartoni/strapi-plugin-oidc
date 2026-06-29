import { SsoError } from "src/services/oauth";

export type SsoErrorCode = keyof typeof SsoError;
