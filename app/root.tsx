declare global {
  interface Window {
    dataLayer: any[];
  }
}

import './styles.css';
import {
  Links,
  Meta,
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
import { headers as headerUtils } from './headers';
import { getUserId } from '~/utils/session.server';

export type RootLoaderData = {
  ENV: {
    NODE_ENV: string;
    GTAG_ID: string;
  };
  user: any | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Get user session
  const userId = await getUserId(request);
  let user = null;
  
  // If user is logged in, you could fetch additional user data here
  if (userId) {
    user = { sub: userId }; // Basic user object, could be expanded
  }
  
  const data: RootLoaderData = { 
    ENV: {  
      NODE_ENV: env.NODE_ENV,
      GTAG_ID: env.GTAG_ID,
    },
    user,
  };
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      ...headerUtils(),
    },
  });
}

export function headers() {
  return {
    "Date": new Date().toUTCString(),
  };
}

export function Document({ 
  children, 
  title = "KiddoBash - Kid Birthday Party Invites made simple" 
}: { 
  children: React.ReactNode;
  title?: string;
}) {
  const data = useLoaderData<RootLoaderData>();
  return (
    <html lang="en" className="dark:bg-gray-950 h-full">
      <head>
        {/* Preconnect to Google Analytics */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* Optimized font loading strategy */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          as="style"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Core Web Vitals and SEO optimization */}
        <meta name="theme-color" content="#4f46e5" />
        <meta name="color-scheme" content="light dark" />
        <meta name="description" content="KiddoBash - Kid Birthday Party Invites made simple" />
        <title>{title}</title>
        
        <Meta />
        <Links />
      </head>
      <body className="text-gray-900 dark:text-gray-100 h-full">
        {children}
        
        <ScrollRestoration />
        
        {/* Scripts */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${data?.ENV?.GTAG_ID}`}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${data?.ENV?.GTAG_ID}');
            `
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data?.ENV || {})};`,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return <Document>{children}</Document>;
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  // Handle 404 errors
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <Document title="Page Not Found - KiddoBash">
        <div className="flex flex-col min-h-screen">
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
        </div>
      </Document>
    );
  }

  return (
    <Document title="Error - KiddoBash">
      <div className="flex flex-col min-h-screen">
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
      </div>
    </Document>
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
