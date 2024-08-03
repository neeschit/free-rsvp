export function headers() {
    return {
        "Cache-Control": "public,max-age=0,s-maxage=5,stale-while-revalidate=300",
    };
}