import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { CognitoUserPoolConfig } from '@aws-amplify/core';

// Client-side configuration using window for environment variables
// These values will be replaced with actual values during the build process by Vite
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: typeof window !== 'undefined' 
        ? (window as any).ENV?.AMPLIFY_AUTH_USER_POOL_ID || '' 
        : '',
      userPoolClientId: typeof window !== 'undefined' 
        ? (window as any).ENV?.AMPLIFY_AUTH_USER_POOL_CLIENT_ID || '' 
        : '',
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
        phone: true,
        username: false
      },
      mfa: {
        status: 'optional' as const,
        totpEnabled: true,
        smsEnabled: true
      }
    }
  }
} satisfies { Auth: { Cognito: CognitoUserPoolConfig } };

// Client-side configuration
export function configureAmplify() {
  Amplify.configure(amplifyConfig);
}

export async function getCurrentSession() {
  try {
    const { tokens } = await fetchAuthSession();
    return tokens;
  } catch (err) {
    console.error('Error getting current session:', err);
    return null;
  }
}

export { Amplify }; 