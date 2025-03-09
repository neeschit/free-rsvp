import { redirect } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { signOut } from 'aws-amplify/auth';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return redirect('/');
  }

  try {
    // Sign out the user
    await signOut();
  } catch (error) {
    // Ignore any errors during sign out
    console.error('Error during sign out:', error);
  }

  return redirect('/login');
} 