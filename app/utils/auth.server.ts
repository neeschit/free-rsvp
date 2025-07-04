import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { env } from '~/config/env.server';

// JWKS client for validating Cognito JWT tokens
const client = jwksClient({
  jwksUri: `https://cognito-idp.${env.COGNITO_REGION}.amazonaws.com/${env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

// Interface for decoded Cognito JWT token
export interface CognitoUser {
  sub: string; // User ID
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;
  'cognito:username'?: string;
  aud: string; // Client ID
  iss: string; // Issuer
  exp: number; // Expiration
  iat: number; // Issued at
  token_use: 'access' | 'id';
}

// Get signing key for JWT verification
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err: Error | null, key: any) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Verify and decode Cognito JWT token
export function verifyToken(token: string): Promise<CognitoUser> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: env.COGNITO_CLIENT_ID,
        issuer: `https://cognito-idp.${env.COGNITO_REGION}.amazonaws.com/${env.COGNITO_USER_POOL_ID}`,
        algorithms: ['RS256'],
      },
      (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(decoded as CognitoUser);
      }
    );
  });
}

// Extract user ID from validated token
export function getUserIdFromToken(token: string): Promise<string> {
  return verifyToken(token).then(user => user.sub);
}

// Generate Cognito Hosted UI login URL
export function getLoginUrl(redirectUri?: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.COGNITO_CLIENT_ID,
    redirect_uri: redirectUri || `${getBaseUrl()}/auth/callback`,
    scope: 'openid email profile',
  });

  return `https://${env.COGNITO_DOMAIN}.auth.${env.COGNITO_REGION}.amazoncognito.com/login?${params}`;
}

// Generate Cognito Hosted UI logout URL
export function getLogoutUrl(redirectUri?: string): string {
  const params = new URLSearchParams({
    client_id: env.COGNITO_CLIENT_ID,
    logout_uri: redirectUri || `${getBaseUrl()}/auth/logout`,
  });

  return `https://${env.COGNITO_DOMAIN}.auth.${env.COGNITO_REGION}.amazoncognito.com/logout?${params}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const tokenEndpoint = `https://${env.COGNITO_DOMAIN}.auth.${env.COGNITO_REGION}.amazoncognito.com/oauth2/token`;
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: env.COGNITO_CLIENT_ID,
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return response.json() as Promise<{
    access_token: string;
    id_token: string;
    token_type: string;
    expires_in: number;
  }>;
}

// Helper to get base URL based on environment
function getBaseUrl(): string {
  if (env.NODE_ENV === 'development') {
    return 'http://localhost:5173';
  }
  
  // Production or staging URL would be set based on your deployment
  return 'https://kiddobash.com';
}