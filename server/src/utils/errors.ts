import { SsoError } from "../services/oauth";

export type SsoErrorCode = keyof typeof SsoError;
