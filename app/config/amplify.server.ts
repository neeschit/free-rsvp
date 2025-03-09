import { Amplify } from 'aws-amplify';
import type { CognitoUserPoolConfig } from '@aws-amplify/core';
import { env } from './env.server';

// Server-side configuration with actual environment variables
export const amplifyServerConfig = {
  Auth: {
    Cognito: {
      userPoolId: env.AMPLIFY_AUTH_USER_POOL_ID,
      userPoolClientId: env.AMPLIFY_AUTH_USER_POOL_CLIENT_ID,
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

// Server-side configuration
export function configureServerAmplify() {
  Amplify.configure(amplifyServerConfig);
}

export { Amplify }; 