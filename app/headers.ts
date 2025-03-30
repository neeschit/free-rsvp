export function headers() {
    return {
        "Cache-Control": "public,max-age=0,s-maxage=300,stale-while-revalidate=600",
    };
}