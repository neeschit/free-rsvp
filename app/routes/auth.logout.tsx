import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getLogoutUrl } from "~/utils/auth.server";
import { logout } from "~/utils/session.server";

// Handle GET requests - redirect to logout URL
export async function loader({ request }: LoaderFunctionArgs) {
  // This handles the redirect back from Cognito after logout
  return redirect("/");
}

// Handle POST requests - initiate logout
export async function action({ request }: ActionFunctionArgs) {
  // Clear the user session
  await logout(request);
  
  // Redirect to Cognito logout URL
  const logoutUrl = getLogoutUrl();
  return redirect(logoutUrl);
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