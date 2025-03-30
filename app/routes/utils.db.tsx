import { Resource } from "sst";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link } from "react-router";
import { headers } from "~/headers";
import { getClient } from "~/model/client";

// Define the type for the loader return data
type LoaderData = {
    items: Record<string, any>[];
    count: number;
    scannedCount: number;
    error?: string;
    message?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
    // For security purposes, we'll restrict this to local development
    const host = request.headers.get("host") || "";
    const adonisParam = new URL(request.url).searchParams.get("adonis");

    if (!host.includes("localhost") && !adonisParam) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/",
                "no-cache": "true",
                "no-index": "true",
                "no-follow": "true",
                "no-archive": "true",
                "no-robots": "true",
                "no-sitemap": "true",
                "no-stylesheet": "true",
                "no-script": "true",
                ...headers(),
            },
        });
    }
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const pkFilter = url.searchParams.get("pk") || undefined;
    
    try {
        const client = getClient();
        
        let scanCommand: ScanCommandInput = {
            TableName: Resource.Kiddobash.name,
            Limit: limit
        };
        
        // Add expression if filtering by PK
        if (pkFilter) {
            scanCommand = {
                ...scanCommand,
                FilterExpression: "begins_with(PK, :pkValue)",
                ExpressionAttributeValues: {
                    ":pkValue": pkFilter
                }
            };
        }
        
        const result = await client.send(new ScanCommand(scanCommand));
        
        return new Response(JSON.stringify({
            items: result.Items || [],
            count: result.Count || 0,
            scannedCount: result.ScannedCount || 0
        } as LoaderData), {
            headers: headers(),
        });
    } catch (error: unknown) {
        console.error("DB Utils error:", error);
        return new Response(JSON.stringify({
            error: "Failed to scan DB",
            message: error instanceof Error ? error.message : String(error),
            items: [],
            count: 0,
            scannedCount: 0
        } as LoaderData), {
            status: 500,
            headers: headers(),
        });
    }
}

export default function DBUtils() {
    const jsonResponse = useLoaderData<typeof loader>();
    
    // Parse the JSON response
    let data: LoaderData;
    try {
        // Handle both string responses and already parsed responses
        if (typeof jsonResponse === 'string') {
            data = JSON.parse(jsonResponse);
        } else if (jsonResponse && typeof jsonResponse === 'object') {
            data = jsonResponse as unknown as LoaderData;
        } else {
            // Fallback if we can't parse the response
            data = { items: [], count: 0, scannedCount: 0 };
        }
    } catch (e) {
        data = { items: [], count: 0, scannedCount: 0 };
        console.error("Error parsing response:", e);
    }
    
    return (
        <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-4">DynamoDB Viewer</h1>
            
            <div className="mb-4">
                <h2 className="text-xl mb-2">Filter Options:</h2>
                <div className="flex flex-wrap gap-2">
                    <Link to="/utils/db" className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">All Items</Link>
                    <Link to="/utils/db?pk=EVENT" className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded">Events Only</Link>
                    <Link to="/utils/db?pk=USER" className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded">Users Only</Link>
                    <Link to="/utils/db?limit=50" className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded">Show 50</Link>
                </div>
            </div>
            
            {data.error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Error</p>
                    <p>{data.error}</p>
                    {data.message && <p className="text-sm">{data.message}</p>}
                </div>
            )}
            
            <div className="overflow-x-auto">
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Stats</h3>
                        <p>Items: {data.count} (Scanned: {data.scannedCount})</p>
                    </div>
                    
                    {data.items && data.items.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {Object.keys(data.items[0] || {}).map((key) => (
                                        <th 
                                            key={key}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                        >
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {data.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        {Object.entries(item).map(([key, value]) => (
                                            <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {key === 'PK' && String(value).startsWith('EVENT#') ? (
                                                    <a 
                                                        href={`/event/${String(value).replace('EVENT#', '')}`}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {String(value)}
                                                    </a>
                                                ) : typeof value === 'object' 
                                                    ? JSON.stringify(value) 
                                                    : String(value)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-4">No items found</div>
                    )}
                    
                    <details className="mt-4">
                        <summary className="cursor-pointer text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">View Raw JSON</summary>
                        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded mt-2 text-xs overflow-auto max-h-96 text-gray-900 dark:text-gray-300">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </details>
                </div>
            </div>
            
            {/* Quick event access section */}
            {data.items && data.items.filter(item => item.PK?.toString().startsWith('EVENT#')).length > 0 && (
                <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Quick Event Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.items
                            .filter(item => item.PK?.toString().startsWith('EVENT#'))
                            .map((event, idx) => (
                                <a 
                                    key={idx} 
                                    href={`/event/${event.PK.replace('EVENT#', '')}`}
                                    className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <div className="font-semibold">{event.EventName || 'Unnamed Event'}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {event.Date ? `${event.Date} at ${event.Time || 'TBD'}` : 'Date TBD'}
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                                        ID: {event.PK.replace('EVENT#', '')}
                                    </div>
                                </a>
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
} 