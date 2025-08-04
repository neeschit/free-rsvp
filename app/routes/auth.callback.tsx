import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { createUserSession } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Import auth.server functions only within server-only functions
  const { exchangeCodeForTokens, verifyToken } = await import("~/utils/auth.server");
  
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const redirectTo = url.searchParams.get("redirectTo") || "/my-events";

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return redirect(`/?error=auth_failed`);
  }

  // Authorization code is required
  if (!code) {
    console.error("No authorization code received");
    return redirect(`/?error=auth_failed`);
  }

  try {
    // Exchange authorization code for tokens
    const callbackUrl = new URL(request.url);
    callbackUrl.searchParams.delete("code");
    callbackUrl.searchParams.delete("state");
    callbackUrl.searchParams.delete("redirectTo");
    
    const tokens = await exchangeCodeForTokens(code, callbackUrl.toString());
    
    // Verify the ID token and extract user info
    const user = await verifyToken(tokens.id_token);
    
    // Create user session and redirect
    return createUserSession(user.sub, redirectTo);
    
  } catch (error) {
    console.error("Token exchange or verification failed:", error);
    return redirect(`/?error=auth_failed`);
  }
}