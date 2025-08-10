import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { commitSession, getUserSession } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Import auth.server functions only within server-only functions
  const { exchangeCodeForTokens, verifyToken } = await import("~/utils/auth.server");
  
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const returnedState = url.searchParams.get("state");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return redirect(`/?error=auth_failed`, { headers: { "Cache-Control": "no-store" } });
  }

  // Authorization code is required
  if (!code) {
    console.error("No authorization code received");
    return redirect(`/?error=auth_failed`, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    // Retrieve server-stored PKCE/state/nonce and redirect target
    const session = await getUserSession(request);
    const expectedState = session.get("oauth:state");
    const codeVerifier = session.get("oauth:code_verifier");
    const expectedNonce = session.get("oauth:nonce");
    const redirectTo = normalizeRedirectPath(session.get("oauth:redirectTo")) || "/my-events";

    if (!expectedState || !codeVerifier) {
      console.error("Missing PKCE or state in session");
      return redirect(`/?error=auth_failed`, { headers: { "Cache-Control": "no-store" } });
    }

    if (!returnedState || returnedState !== expectedState) {
      console.error("State mismatch in OAuth callback");
      return redirect(`/?error=auth_failed`, { headers: { "Cache-Control": "no-store" } });
    }

    // Exchange authorization code for tokens using code_verifier
    const callbackUrl = new URL(request.url);
    callbackUrl.searchParams.delete("code");
    callbackUrl.searchParams.delete("state");
    
    const tokens = await exchangeCodeForTokens(code, callbackUrl.toString(), codeVerifier);
    
    // Verify the ID token and extract user info
    const user = await verifyToken(tokens.id_token);
    
    // Verify nonce claim if we sent one
    if (expectedNonce && user.nonce !== expectedNonce) {
      console.error("Nonce mismatch in ID token");
      return redirect(`/?error=auth_failed`, { headers: { "Cache-Control": "no-store" } });
    }
    
    // Clear ephemeral oauth data and set userId in the same session
    session.unset("oauth:state");
    session.unset("oauth:code_verifier");
    session.unset("oauth:nonce");
    session.unset("oauth:redirectTo");
    session.set("userId", user.sub);
    const setCookie = await commitSession(session);

    // Redirect to destination with updated session cookie
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectTo,
        "Set-Cookie": setCookie,
        "Cache-Control": "no-store",
      },
    });
    
  } catch (error) {
    console.error("Token exchange or verification failed:", error);
    return redirect(`/?error=auth_failed`, { headers: { "Cache-Control": "no-store" } });
  }
}

function normalizeRedirectPath(input: string | null | undefined): string | undefined {
  if (!input) return undefined;
  try {
    const decoded = decodeURIComponent(String(input));
    if (/^\/(?!\/)/.test(decoded)) {
      return decoded;
    }
  } catch {}
  return undefined;
}