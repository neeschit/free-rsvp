/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "kiddobash",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },
    async run() {
        const table = new sst.aws.Dynamo("Kiddobash", {
            fields: {
                PK: "string",
                SK: "string",
                HostId: "string",
                CreatedAt: "string",
                RSVPStatus: "string",
                Date: "string",
            },
            primaryIndex: { hashKey: "PK", rangeKey: "SK" },
            globalIndexes: {
                HostIndex: {
                    hashKey: "HostId",
                    rangeKey: "CreatedAt",
                    projection: "all",
                },
                RSVPStatusIndex: {
                    hashKey: "RSVPStatus",
                    rangeKey: "Date",
                    projection: "all",
                },
            },
        });

        // Define secrets
        const gtagIdSecret = new sst.Secret("GTAG_ID");

        new sst.aws.React("KiddobashWeb", {
            link: [table, gtagIdSecret],
            environment: {
                NODE_ENV: process.env.NODE_ENV || "production",
                GTAG_ID: gtagIdSecret.value,
            },
            domain: $app.stage === "production" ? {
                name: "kiddobash.com",
                redirects: ["www.kiddobash.com"],
            } : undefined,
            invalidation: {
                wait: true,
            },
            assets: {
                versionedFilesCacheHeader: "public,max-age=31536000,immutable",
            }
        });
    },
});
