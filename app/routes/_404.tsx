import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Page Not Found - KiddoBash" },
    { name: "description", content: "The page you're looking for could not be found." },
  ];
};

// This is a "splat route" that will catch all unmatched URLs
export const handle = { status: 404 };

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow py-20 px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
} 