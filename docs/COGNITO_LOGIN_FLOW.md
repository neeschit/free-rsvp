# AWS Cognito Login Flow

This document explains how sign-in and sign-out work end-to-end with AWS Cognito, matching the structure and tone of `COGNITO_INTEGRATION_STATUS.md` and reflecting the final integrated state.

## ✅ What’s Implemented

- **Hosted UI OAuth Code Flow** via Cognito
- **PKCE (S256)** with `code_challenge`/`code_verifier`
- **Opaque OAuth `state`** stored server‑side and validated on callback
- **Nonce** included in login and verified in the `id_token`
- **Server-side token verification** using JWKS (RS256, `aud` and `iss` checks)
- **SSR session** using an HTTP-only cookie that stores only the Cognito `sub` (user id)
- **Route protection** using a reusable `requireAuth` wrapper and per-loader checks
- **Friendly redirects** back to the page users intended to visit (via OAuth `state`)
- **Managed sign-out** that clears app session and calls Cognito `/logout`
- **Hosted UI dark mode** auto-detection configured in Cognito Console (per user pool)
 - **Security headers** (CSP, HSTS in production, frame-ancestors none)
 - **Defense-in-depth CSRF**: SameSite=Lax cookies + Origin/Referer checks on POST

## 🔐 How Sign‑in Works (End‑to‑End)

1. **User hits a protected page**
   - If the route uses `requireAuth`, unauthenticated users are redirected to `/auth/login?redirectTo=<intended-path>`.
   - Some loaders also explicitly call `getUserId(request)` and gate features accordingly.

2. **`/auth/login` redirects to Cognito Hosted UI**
   - The loader generates and stores in the server session: random `state`, `nonce`, and PKCE `code_verifier` (derives `code_challenge` with S256).
   - It builds the Hosted UI URL with `response_type=code`, `scope=openid email profile`, `redirect_uri` to `/auth/callback`, plus `state`, `nonce`, and `code_challenge`.
   - The intended `redirectTo` is stored server‑side (not in `state`).

3. **User authenticates on Cognito Hosted UI**
   - Cognito Hosted UI is configured in the AWS Console with auto dark mode detection. UI styles switch based on the user’s OS/browser theme. This is configured per user pool (not yet centralized/scalable).

4. **Cognito redirects back to `/auth/callback?code=...&state=...`**
   - The server validates `state` against the value stored in the session.
   - It exchanges the authorization code for tokens using the stored PKCE `code_verifier` at Cognito’s `/oauth2/token`.
   - It verifies the `id_token` using Cognito JWKS with checks for `alg=RS256`, matching `aud` and `iss`, `token_use === "id"`, and matching `nonce`.

5. **Server creates a session and discards tokens**
   - The server stores only `userId = sub` in an HTTP-only cookie (no tokens stored client-side).
   - Ephemeral OAuth values (`state`, `nonce`, `code_verifier`, `redirectTo`) are cleared from the session.
   - User is redirected to the server‑stored `redirectTo` (safely normalized to internal paths) or `/my-events`.

## 🚪 How Sign‑out Works

1. Clicking “Logout” submits a POST to `/auth/logout`.
2. The server immediately destroys the local session cookie and redirects the user to Cognito’s `/logout` with a `logout_uri` back to `/auth/logout`.
3. Cognito clears the Hosted UI session and redirects back to `/auth/logout` (GET), which finalizes local cleanup and then redirects to `/`.

## 🧩 Key Files

- Auth utilities: `app/utils/auth.server.ts`
  - Builds Hosted UI URLs, exchanges code for tokens, verifies JWT with JWKS, computes base URL.
- Session: `app/utils/session.server.ts`
  - HTTP-only cookie session, stores only `userId` for ~7 days; secure in production.
- Route guard: `app/utils/requireAuth.ts`
  - Wraps loaders, redirecting to `/auth/login?redirectTo=...` when unauthenticated.
- Routes
  - `app/routes/auth.login.tsx`: redirects to Cognito Hosted UI
  - `app/routes/auth.callback.tsx`: code exchange, token verify, session creation
  - `app/routes/auth.logout.tsx`: local destroy + Cognito `/logout` roundtrip
- UI
  - `app/components/AuthButton.tsx`: Login link / Logout form
  - `app/components/Header.tsx`: Shows authenticated nav when `user` exists
- Root loader: `app/root.tsx`
  - Exposes `{ user: { sub } }` if session exists (SSR), used by the header/auth button
 - Headers: `app/headers.ts`
   - Adds CSP, HSTS (prod), frame-ancestors none, and other security headers

## 🔒 Security Details

- **JWT verification** uses Cognito JWKS and validates:
  - Algorithm: `RS256`
  - Audience: `COGNITO_CLIENT_ID`
  - Issuer: `https://cognito-idp.<region>.amazonaws.com/<userPoolId>`
  - `token_use === "id"`
  - `nonce` claim matches the server‑stored nonce
  - Small `clockTolerance` applied to account for skew
- **Session cookie**
  - HTTP-only, `SameSite=Lax`, `Secure` in production, 7-day expiry
  - Name is `__Host-kiddobash_session` in production (host-only cookie)
  - Stores only the Cognito `sub` (no access/id/refresh tokens are persisted)
- **SSR-first**: All auth checks happen on the server in loaders; the client doesn’t handle tokens.
- **PKCE**: S256 code challenge is used during login and `code_verifier` during token exchange.
- **State**: Random opaque value stored server-side and validated on callback.
- **Redirect safety**: `redirectTo` is stored server-side and normalized; only internal paths `^/(?!/)` are allowed.
- **Security headers**: CSP, `frame-ancestors 'none'`, HSTS in production, and strict referrer policy.
- **CSRF hardening**: SameSite=Lax cookies plus Origin/Referer validation on state-changing POST routes.

## 🔀 Redirects and `state`

- `state` is an opaque random value stored server-side and validated on callback to protect against login CSRF.
- The intended destination is stored in the server session, not in `state`. After sign-in, we read it from the session, normalize to an internal path, and redirect (default `/my-events`).

## 🌓 Hosted UI Dark Mode (Managed in Cognito)

- Dark mode auto-detection is configured directly in the Cognito Console for each user pool’s Hosted UI (managed login).
- The UI adapts to the user’s OS/browser theme (e.g., prefers-color-scheme).
- Note: This is configured per user pool today and is not yet centralized, so it’s functional but not highly scalable.

## 🌐 Environments and URLs

- Base URL is derived server-side:
  - Development: `http://localhost:5173`
  - Production: `https://kiddobash.com`
- Callback: `<base>/auth/callback`
- Logout return: `<base>/auth/logout`

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `COGNITO_CLIENT_ID` | Cognito App Client ID |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `COGNITO_REGION` | AWS region (e.g., `us-east-1`) |
| `COGNITO_DOMAIN` | Hosted UI domain prefix (e.g., `kiddobash-dev`) |
| `SESSION_SECRET` | Cookie signing secret (32+ chars, required) |

These are validated in `app/config/env.server.ts` (min length enforced for `SESSION_SECRET`).

How to set `SESSION_SECRET`:
- Development: add to `.env` as a 32+ char random string (e.g., `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
- Production: store via `sst secret set SESSION_SECRET <value>` and expose it to the app (link the secret in `sst.config.ts` so it’s available at runtime).

## 🔎 Protected Areas

- Pages and APIs that either wrap loaders with `requireAuth` or check `getUserId(request)`:
  - `app/routes/my-events.tsx`
  - `app/routes/create-event.tsx`
  - `app/routes/rsvp.$eventId.tsx`
  - `app/routes/event.$eventId.tsx`
  - `app/routes/api.send-invites.tsx`

## ✅ How to Test Locally

1. Ensure env vars are set (see above) and the dev server is running.
2. Navigate to a protected route like `/my-events`.
3. You should be redirected to Cognito Hosted UI; sign in.
4. On success, `state` is validated, tokens are exchanged with PKCE, `id_token` is verified (incl. `nonce`), a session cookie is set; visit protected pages.
5. Click “Logout”; confirm you’re logged out locally and on the Hosted UI.

## 🚧 Troubleshooting

- "Invalid client or redirect_uri": Verify `COGNITO_CLIENT_ID`, `COGNITO_DOMAIN`, and Cognito App Client callback/allowed logout URLs.
- "Token exchange failed" or JWT verify errors: Confirm `COGNITO_REGION`, `COGNITO_USER_POOL_ID`, and time skew; ensure `aud` and `iss` match your pool and client.
- Session not persisting: Check `SESSION_SECRET` and that cookies are not blocked; in production, `secure` cookies require HTTPS.
- "State mismatch" on callback: Ensure cookies are enabled and the login domain matches the app origin used to initiate login.
- "Nonce mismatch" on callback: Retry login; if persistent, check clock sync and that only one login tab was used.
- "Authorization code not accepted" (PKCE): Confirm the stored `code_verifier` exists and matches the `code_challenge` (S256).

## 📝 Notes & Decisions

- We intentionally do not store access/refresh tokens in the browser or session. After verifying `id_token` on callback, the server stores only the Cognito `sub` in an HTTP-only cookie.
- The current Hosted UI theme (including dark mode) is configured in Cognito Console, per user pool. Centralized/themed configuration may be revisited later for scalability.
 - We use PKCE + server-stored `state`/`nonce` to mitigate code interception and login CSRF.
