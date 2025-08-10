import { Form } from "react-router";
import { getUserDisplayName } from "~/utils/userHelpers";

interface AuthButtonProps {
  user: any;
  className?: string;
  isMobile?: boolean;
}

export function AuthButton({ user, className = "", isMobile = false }: AuthButtonProps) {
  // Use direct boolean check instead of imported function for SSR safety
  const isAuthenticated = Boolean(user && user.sub);
  
  if (isAuthenticated) {
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
            className="bg-red-700 text-white px-4 py-2 rounded-full hover:bg-red-800 transition-colors text-sm"
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