/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "remix-auth-app",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },
    async run() {
        const table = new sst.aws.Dynamo("Events", {
            fields: {
                ownerId: "string",
                eventId: "string",
                createdAt: "number",
            },
            primaryIndex: { hashKey: "eventId", rangeKey: "ownerId" },
            localIndexes: {
                CreateAtIndex: {
                    rangeKey: "createdAt",
                },
            },
        });

        new sst.aws.Remix("MyWeb", {
            link: [table],
            domain: {
                name: "kiddobash.com",
                redirects: ["www.kiddobash.com"],
            },
            invalidation: {
                wait: true,
            },
            assets: {
                versionedFilesCacheHeader: "public,max-age=31536000,immutable",
            }
        });
    },
});
