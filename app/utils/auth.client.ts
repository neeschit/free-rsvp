// Client-side authentication utilities

// Check if user is authenticated based on user data from loader
export function isAuthenticated(user: any): boolean {
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

// Get user display name from user object
export function getUserDisplayName(user: any): string {
  if (!user) return '';
  
  return user.email || user.preferred_username || user['cognito:username'] || 'User';
}

// Get user email from user object
export function getUserEmail(user: any): string | null {
  if (!user) return null;
  
  return user.email || null;
}