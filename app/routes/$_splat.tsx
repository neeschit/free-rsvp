import { headers } from "~/headers";

export function loader() {
  // Return a 404 response for any path captured by this splat route
  throw new Response("Not Found", { 
    status: 404,
    headers: headers()
  });
}

export default function CatchAllRoute() {
  // This should never render since the loader will redirect
  return null;
} 