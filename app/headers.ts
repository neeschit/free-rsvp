export function headers() {
    return {
        "Cache-Control": "public,max-age=0,s-maxage=300,stale-while-revalidate=600",
        // Add security headers
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };
}
