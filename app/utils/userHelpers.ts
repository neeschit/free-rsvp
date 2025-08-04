// Shared user utility functions that work in both SSR and client environments

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

// Check if user is authenticated based on user data
export function isAuthenticated(user: any): boolean {
  return Boolean(user && user.sub);
} 