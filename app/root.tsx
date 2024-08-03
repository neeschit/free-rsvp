import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ColorSchemeScript, MantineProvider, AppShell, Text } from '@mantine/core';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme='auto'>
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
            <AppShell.Header style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
              <Text>
              ☕
              </Text>
            </AppShell.Header>
            <AppShell.Main style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
              {children}
            </AppShell.Main>
            <AppShell.Footer style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
              <Text size='xs'>Free anonymous rsvps for your events.</Text>
            </AppShell.Footer>
          </AppShell>
        </MantineProvider>
        <ScrollRestoration /> 
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
