import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';

export type AuthData = {
  isAuthenticated: boolean;
  user: {
    sub?: string;
    email?: string;
  } | null;
};

// Get auth session (Amplify is already configured at the server level)
export async function getAuthSession(request: Request): Promise<AuthData> {
  try {
    // Fetch the auth session
    const session = await fetchAuthSession();

    return {
      isAuthenticated: session.tokens?.accessToken !== undefined,
      user: session.tokens ? {
        sub: session.tokens.idToken?.payload.sub as string | undefined,
        email: session.tokens.idToken?.payload.email as string | undefined,
      } : null
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      isAuthenticated: false,
      user: null
    };
  }
}

// Require authentication for a route
export async function requireAuth(request: Request): Promise<AuthData> {
  const authData = await getAuthSession(request);
  
  if (!authData.isAuthenticated) {
    throw redirect('/login');
  }
  
  return authData;
}

// Sign out the user
export async function signOutUser(): Promise<void> {
  await signOut();
}

// Legacy function for backward compatibility
export async function authLoader({ request }: LoaderFunctionArgs): Promise<AuthData> {
  return getAuthSession(request);
} 