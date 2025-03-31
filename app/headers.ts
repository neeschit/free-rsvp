export function headers() {
    const expiresDate = new Date();
    expiresDate.setTime(expiresDate.getTime() + 300 * 1000); // 5 minutes in the future (matches s-maxage=300)
    
    return {
        "Cache-Control": "public,max-age=0,s-maxage=300,stale-while-revalidate=600",
        "Expires": expiresDate.toUTCString(),
        // Add security headers
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };
}
