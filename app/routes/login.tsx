import { Authenticator } from '@aws-amplify/ui-react';
import { Text } from '@mantine/core';
import { redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import { fetchAuthSession } from 'aws-amplify/auth';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Check if user is already authenticated
    const session = await fetchAuthSession();
    
    if (session.tokens?.accessToken) {
      return redirect('/');
    }
  } catch (error) {
    // Not authenticated, show login page
  }
  return null;
}

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <Authenticator
        initialState="signIn"
        components={{
          Header() {
            return (
              <Text size="xl" fw={700} ta="center" mt="xl">
                Free RSVP
              </Text>
            );
          }
        }}
        formFields={{
          signIn: {
            username: {
              placeholder: 'Enter your email or phone number'
            }
          },
          signUp: {
            email: {
              order: 1,
              isRequired: true
            },
            phone_number: {
              order: 2,
              isRequired: false
            },
            password: {
              order: 3
            },
            confirm_password: {
              order: 4
            }
          }
        }}
        hideSignUp={false}
        socialProviders={[]}
      >
        {({ user }) => {
          if (user) {
            navigate('/', { replace: true });
            return <div>Redirecting...</div>;
          }
          return <div>Loading...</div>;
        }}
      </Authenticator>
    </div>
  );
} 