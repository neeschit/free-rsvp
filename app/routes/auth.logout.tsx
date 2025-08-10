import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { logout } from "~/utils/session.server";

// Handle GET requests - this handles the redirect back from Cognito after logout
export async function loader({ request }: LoaderFunctionArgs) {
  // Clear all session data when coming back from Cognito
  const destroyedSession = await logout(request);
  
  // Redirect to home page after logout with the session cleared
  return redirect("/", {
    headers: {
      "Set-Cookie": destroyedSession,
      "Cache-Control": "no-store",
    },
  });
}

// Handle POST requests - initiate logout process
export async function action({ request }: ActionFunctionArgs) {
  // Import auth.server functions only within server-only functions
  const { getLogoutUrl } = await import("~/utils/auth.server");
  
  // Clear the local session first
  const destroyedSession = await logout(request);
  
  // Get the base URL for the logout redirect
  const url = new URL(request.url);
  const logoutRedirectUrl = `${url.origin}/auth/logout`;
  
  // Redirect to Cognito logout URL which will invalidate tokens and redirect back
  const logoutUrl = getLogoutUrl(logoutRedirectUrl);
  return redirect(logoutUrl, {
    headers: {
      "Set-Cookie": destroyedSession,
      "Cache-Control": "no-store",
    },
  });
}

// Default component for logout page
export default function LogoutPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-gray-600">Please wait while we log you out.</p>
      </div>
    </div>
  );
}