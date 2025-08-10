import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserId } from "~/utils/session.server";

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
  
  // Generate callback URL (do not include app-specific redirect as part of redirect_uri)
  const callbackUrl = new URL("/auth/callback", url.origin);
  
  // Use OAuth state to carry app-specific redirect destination
  const state = redirectTo ? `redirectTo=${encodeURIComponent(redirectTo)}` : undefined;
  
  // Redirect to Cognito Hosted UI
  const loginUrl = getLoginUrl(callbackUrl.toString(), state);
  return redirect(loginUrl);
}