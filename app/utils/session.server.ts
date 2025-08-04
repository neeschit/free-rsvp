import { createCookieSessionStorage } from "react-router";

// Session configuration for storing user authentication
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__kiddobash_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "fallback-secret-for-development"],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function createUserSession(
  userId: string,
  redirectTo: string = "/"
) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return session;
}

export async function getUserId(request: Request): Promise<string | null> {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  return userId || null;
}

export async function requireUserId(request: Request): Promise<string> {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return userId;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return sessionStorage.destroySession(session);
}