import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@aws-amplify/ui-react/styles.css';

import {
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { AppShell, Text, MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { getAuthSession, type AuthData } from './utils/auth.server';
import { env } from './config/env.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Skip auth check for login page
  if (url.pathname === '/login') {
    return json<{ auth: null; ENV: typeof env }>({ 
      auth: null,
      ENV: {
        AMPLIFY_AUTH_USER_POOL_ID: env.AMPLIFY_AUTH_USER_POOL_ID,
        AMPLIFY_AUTH_USER_POOL_CLIENT_ID: env.AMPLIFY_AUTH_USER_POOL_CLIENT_ID,
        NODE_ENV: env.NODE_ENV
      }
    });
  }

  // Get auth data
  const authData = await getAuthSession(request);
  
  // Redirect to login if not authenticated and not on the login page
  if (!authData.isAuthenticated) {
    return redirect('/login');
  }
  
  return json<{ auth: AuthData; ENV: typeof env }>({ 
    auth: authData,
    ENV: {
      AMPLIFY_AUTH_USER_POOL_ID: env.AMPLIFY_AUTH_USER_POOL_ID,
      AMPLIFY_AUTH_USER_POOL_CLIENT_ID: env.AMPLIFY_AUTH_USER_POOL_CLIENT_ID,
      NODE_ENV: env.NODE_ENV
    }
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "RSVP for Free" },
    { name: "description", content: "Create an event to track RSVPs for free" },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto">
          <DatesProvider settings={{
            consistentWeeks: true,
            locale: 'en_US'
          }}>
            {data.auth?.isAuthenticated === true ? (
              <AppShell header={{
                height: {
                  base: 30,
                  md: 45,
                  xl: 60,
                }
              }}
                footer={{
                  height: 20
                }} style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
                <AppShell.Header style={{ paddingLeft: "1rem", paddingRight: "1rem", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text>☕</Text>
                  <form action="/logout" method="post">
                    <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                      Sign Out
                    </button>
                  </form>
                </AppShell.Header>
                <AppShell.Main style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
                  {children}
                </AppShell.Main>
                <AppShell.Footer style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
                  <Text size='xs'>Free anonymous rsvps for your events.</Text>
                </AppShell.Footer>
              </AppShell>
            ) : (
              <>{children}</>
            )}
          </DatesProvider>
        </MantineProvider>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)};`,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
