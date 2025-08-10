import { env } from "~/config/env.server";

export function headers() {
    const isProd = env.NODE_ENV === "production";
    const base: Record<string, string> = {
        "Cache-Control": "public,max-age=0,s-maxage=300,stale-while-revalidate=600",
        // Security headers
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        // Conservative CSP allowing our own origin + required third parties
        // Note: adjust hosts as needed; avoid 'unsafe-inline' except for GA bootstrap where necessary
        "Content-Security-Policy": [
            "default-src 'self'",
            "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com 'unsafe-inline'",
            "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
            "img-src 'self' data: https://www.google-analytics.com",
            "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
            "font-src 'self' https://fonts.gstatic.com",
            "frame-ancestors 'none'",
        ].join('; '),
        // Modern protections
        "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()",
    };

    if (isProd) {
        base["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
    }

    return base;
}

// New function to generate no-cache headers
export function noCacheHeaders() {
    const baseHeaders = headers(); // Get base security headers
    return {
        ...baseHeaders,
        "Cache-Control": "no-store, no-cache, must-revalidate",
    };
}
