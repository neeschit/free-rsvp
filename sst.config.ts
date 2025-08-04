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
                InviteId: "string",
                SentAt: "string",
                RecipientEmail: "string",
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
                InviteIndex: {
                    hashKey: "InviteId",
                    rangeKey: "SentAt",
                    projection: "all",
                },
                RecipientIndex: {
                    hashKey: "RecipientEmail",
                    rangeKey: "SentAt",
                    projection: "all",
                },
            },
        });

        // S3 bucket for storing received emails
        const emailBucket = new sst.aws.Bucket("KiddobashEmailReceiver");

        // Email component for sending invites - reference existing identity
        const email = sst.aws.Email.get("KiddobashEmail", "noreply@kiddobash.com");

        // Cognito User Pool for authentication
        const userPool = new sst.aws.CognitoUserPool("KiddobashUserPool", {
            usernames: ["email"],
            transform: {
                userPool: (args) => {
                    args.passwordPolicy = {
                        minimumLength: 8,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSymbols: false,
                        requireUppercase: true,
                    };
                    args.autoVerifiedAttributes = ["email"];
                    args.usernameAttributes = ["email"];
                },
            },
        });

        const userPoolClient = userPool.addClient("KiddobashWebClient", {
            transform: {
                client: (args) => {
                    args.allowedOauthFlows = ["code"];
                    args.allowedOauthScopes = ["openid", "email", "profile"];
                    args.allowedOauthFlowsUserPoolClient = true;
                    args.callbackUrls = [
                        "http://localhost:5173/auth/callback", // Local development
                        ...$app.stage === "production" 
                            ? ["https://kiddobash.com/auth/callback"]
                            : [`https://${$app.name}-${$app.stage}.sst.dev/auth/callback`]
                    ];
                    args.logoutUrls = [
                        "http://localhost:5173/auth/logout", // Local development  
                        ...$app.stage === "production"
                            ? ["https://kiddobash.com/auth/logout"] 
                            : [`https://${$app.name}-${$app.stage}.sst.dev/auth/logout`]
                    ];
                    args.supportedIdentityProviders = ["COGNITO"];
                    args.generateSecret = false;
                },
            },
        });

        // Create Cognito domain using Pulumi AWS resource directly
        const userPoolDomain = new aws.cognito.UserPoolDomain("KiddobashAuthDomain", {
            domain: `kiddobash-${$app.stage}`,
            userPoolId: userPool.id,
        });

        // Define secrets
        const gtagIdSecret = new sst.Secret("GTAG_ID");

        new sst.aws.React("KiddobashWeb", {
            link: [
                table, 
                gtagIdSecret, 
                email, 
                emailBucket, 
                userPool, 
                userPoolClient, 
                userPoolDomain
            ],
            environment: {
                NODE_ENV: process.env.NODE_ENV || "production",
                GTAG_ID: gtagIdSecret.value,
                COGNITO_CLIENT_ID: userPoolClient.id,
                COGNITO_USER_POOL_ID: userPool.id,
                COGNITO_REGION: aws.getRegionOutput().name,
                COGNITO_DOMAIN: userPoolDomain.domain,
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
