import { Form } from "react-router";
import { isAuthenticated, getUserDisplayName } from "~/utils/auth.client";

interface AuthButtonProps {
  user: any;
  className?: string;
  isMobile?: boolean;
}

export function AuthButton({ user, className = "", isMobile = false }: AuthButtonProps) {
  if (isAuthenticated(user)) {
    // User is logged in - show user info and logout option
    const displayName = getUserDisplayName(user);
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {!isMobile && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {displayName}
          </span>
        )}
        <Form method="post" action="/auth/logout">
          <button
            type="submit"
            className="bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors text-sm"
          >
            Logout
          </button>
        </Form>
      </div>
    );
  }

  // User is not logged in - show login button
  return (
    <a
      href="/auth/login"
      className={`bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors text-sm ${className}`}
    >
      Login
    </a>
  );
}