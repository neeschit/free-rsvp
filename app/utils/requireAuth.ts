import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserId } from "~/utils/session.server";

// Higher-order function to protect routes that require authentication
export function requireAuth<T>(loader: (args: LoaderFunctionArgs) => Promise<T> | T) {
  return async (args: LoaderFunctionArgs): Promise<T | Response> => {
    const userId = await getUserId(args.request);
    
    if (!userId) {
      // Store the intended destination to redirect after login
      const url = new URL(args.request.url);
      const redirectTo = url.pathname + url.search;
      const loginUrl = `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`;
      
      throw redirect(loginUrl);
    }
    
    return loader(args);
  };
}