import { BodyInit, HeadersInit } from "undici-types";

const FORM_URL_ENCODED = "application/x-www-form-urlencoded";

async function fetchJson(url: string, options: RequestInit = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = (await response.text().catch(() => "")).slice(0, 1024);
    const message = [response.status, body].filter(Boolean).join(", ");
    throw new Error(`Request to ${url} failed with status ${message}`);
  }
  return response.json();
}

export function postForm(url: string, params: BodyInit) {
  return fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": FORM_URL_ENCODED },
    body: params,
  });
}

export function getJson(url: string, headers: HeadersInit = {}) {
  return fetchJson(url, { method: "GET", headers });
}
