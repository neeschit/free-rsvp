// Shared user utility functions that work in both SSR and client environments

// Get user display name from user object
export function getUserDisplayName(user: any): string {
  if (!user) return '';
  
  return user.email || user.preferred_username || user['cognito:username'] || 'User';
}

// Note: Removed unused helpers `getUserEmail` and `isAuthenticated`.