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
            invalidation: {
                wait: true,
            },
            assets: {
                versionedFilesCacheHeader: "public,max-age=31536000,immutable",
            },
            environment: {
                AMPLIFY_AUTH_USER_POOL_ID: "us-east-1_H3LFR9rSl",
                AMPLIFY_AUTH_USER_POOL_CLIENT_ID: "6n1tsih417uhki8jumlh04mmll",
            },
        });
    },
});
