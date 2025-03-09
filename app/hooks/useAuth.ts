import { useCallback, useState } from 'react';
import { signIn, signOut, signUp, confirmSignUp, setUpTOTP, verifyTOTPSetup } from 'aws-amplify/auth';
import type { SignUpInput } from 'aws-amplify/auth';
import { useLoaderData } from '@remix-run/react';

type AuthError = {
  message: string;
};

type AuthLoaderData = {
  isAuthenticated: boolean;
  user?: {
    username: string;
    email: string;
    isMfaEnabled: boolean;
  };
};

export const useAuth = () => {
  const { isAuthenticated, user } = useLoaderData<AuthLoaderData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = useCallback(async (input: SignUpInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp(input);
      return result;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleConfirmSignUp = useCallback(async (username: string, confirmationCode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await confirmSignUp({
        username,
        confirmationCode
      });
      return result;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignIn = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn({
        username,
        password
      });
      return result;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSetupTOTP = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await setUpTOTP();
      return result;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVerifyTOTP = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await verifyTOTPSetup({
        code
      });
      return result;
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signOut();
    } catch (err) {
      const authError = err as AuthError;
      setError(authError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    setupTOTP: handleSetupTOTP,
    verifyTOTP: handleVerifyTOTP
  };
}; 