import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserId } from "~/utils/session.server";
import { createHash, randomBytes } from "crypto";
import { commitSession } from "~/utils/session.server";
import { getUserSession } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Import auth.server functions only within server-only functions
  const { getLoginUrl } = await import("~/utils/auth.server");
  
  // If user is already logged in, redirect to dashboard
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/my-events");
  }

  // Get the redirect URL from query params (where to go after login)
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");
  // Normalize and restrict redirectTo to internal paths only
  const safeRedirectTo = normalizeRedirectPath(redirectTo);

  // Generate callback URL (do not include app-specific redirect as part of redirect_uri)
  const callbackUrl = new URL("/auth/callback", url.origin);

  // Prepare PKCE (S256), state and nonce; store server-side
  const session = await getUserSession(request);
  const codeVerifier = generateRandomString(64);
  const codeChallenge = toCodeChallenge(codeVerifier);
  const state = generateRandomString(32);
  const nonce = generateRandomString(32);
  session.set("oauth:code_verifier", codeVerifier);
  session.set("oauth:state", state);
  session.set("oauth:nonce", nonce);
  if (safeRedirectTo) {
    session.set("oauth:redirectTo", safeRedirectTo);
  }

  const setCookie = await commitSession(session);

  // Redirect to Cognito Hosted UI
  const loginUrl = getLoginUrl(callbackUrl.toString(), state, nonce, codeChallenge);
  return redirect(loginUrl, { headers: { "Set-Cookie": setCookie, "Cache-Control": "no-store" } });
}

function generateRandomString(length: number): string {
  // 32 bytes -> 64 hex chars when length=64 etc.; slice to length
  const bytes = randomBytes(32);
  return createHash("sha256").update(bytes).digest("hex").slice(0, length);
}

function toCodeChallenge(codeVerifier: string): string {
  const digest = createHash("sha256").update(codeVerifier).digest();
  return base64UrlEncode(digest);
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function normalizeRedirectPath(input: string | null): string | undefined {
  if (!input) return undefined;
  try {
    const decoded = decodeURIComponent(input);
    // allow only single leading slash paths, disallow '//' (protocol-relative) and absolute URLs
    if (/^\/(?!\/)/.test(decoded)) {
      return decoded;
    }
  } catch {}
  return undefined;
}