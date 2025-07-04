import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getLoginUrl } from "~/utils/auth.server";
import { getUserId } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // If user is already logged in, redirect to dashboard
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/my-events");
  }

  // Get the redirect URL from query params (where to go after login)
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");
  
  // Generate callback URL with redirect destination
  const callbackUrl = new URL("/auth/callback", url.origin);
  if (redirectTo) {
    callbackUrl.searchParams.set("redirectTo", redirectTo);
  }
  
  // Redirect to Cognito Hosted UI
  const loginUrl = getLoginUrl(callbackUrl.toString());
  return redirect(loginUrl);
}