declare global {
  interface Window {
    dataLayer: any[];
  }
}

import './styles.css';
import {
  Links,
  Meta,
  type MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { env } from './config/env.server';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export type RootLoaderData = {
  ENV: {
    NODE_ENV: string;
    GTAG_ID: string;
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const data: RootLoaderData = { 
    ENV: {  
      NODE_ENV: env.NODE_ENV,
      GTAG_ID: env.GTAG_ID,
    }
  };
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<RootLoaderData>();

  return (
    <html lang="en" className="dark:bg-gray-950 h-full">
      <head>
      <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
        {/* Google tag (gtag.js) */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${data?.ENV?.GTAG_ID}`}></script>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.dataLayer = window.dataLayer || [];
                function gtag(){ window.dataLayer.push(arguments); }
                gtag('js', new Date());
                gtag('config', '${data?.ENV?.GTAG_ID}');
              }
            `
          }}
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="text-gray-900 dark:text-gray-100 h-full">
        {children}
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data?.ENV)};`,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  // Handle 404 errors
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <html lang="en" className="dark:bg-gray-950 h-full">
        <head>
          <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Page Not Found - KiddoBash</title>
          <Meta />
          <Links />
        </head>
        <body className="text-gray-900 dark:text-gray-100 flex flex-col min-h-screen h-full">
          <Header />
          <div className="flex-grow flex flex-col items-center justify-center px-4">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
            <p className="text-gray-600 mb-8 text-center">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Return Home
            </a>
          </div>
          <Footer />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark:bg-gray-950 h-full">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - KiddoBash</title>
        <Meta />
        <Links />
      </head>
      <body className="text-gray-900 dark:text-gray-100 flex flex-col min-h-screen h-full">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-8 text-center">
            We're sorry, an unexpected error has occurred.
          </p>
          <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Return Home
          </a>
        </div>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
