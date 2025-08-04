// Client-side authentication utilities

// Check if user is authenticated based on user data from loader
export function isAuthenticated(user: any): boolean {
  return Boolean(user && user.sub);
}

// Server-safe version that can be used in SSR contexts
export function isAuthenticatedSSR(user: any): boolean {
  // Same logic but explicitly designed to work in SSR
  return Boolean(user && user.sub);
}

// Generate login URL for redirect (this would be handled server-side usually)
export function redirectToLogin() {
  window.location.href = '/auth/login';
}

// Generate logout URL for redirect
export function redirectToLogout() {
  window.location.href = '/auth/logout';
}