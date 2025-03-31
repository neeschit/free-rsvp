# Welcome to Remix + Vite!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/future/vite) for details on supported features.

## Development

Run the Vite dev server:

```shellscript
pnpm dev
```

## Deployment

First, build your app for production:

```sh
pnpm build
```

Then run the app in production mode:

```sh
pnpm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `pnpm build`

- `build/server`
- `build/client`

## Database Management

### Resetting Database Tables

Multiple methods are available to reset the DynamoDB tables without redeploying:

#### Using npm scripts (interactive):

```bash
# Reset development database (with confirmation)
npm run reset-db:dev

# Reset production database (with confirmation)
npm run reset-db:prod
```

#### Using npm scripts (non-interactive):

```bash
# Force reset development database (no confirmation)
npm run force-reset-db:dev

# Force reset production database (no confirmation)
npm run force-reset-db:prod
```

#### Using direct scripts:

```bash
# Using Node.js batch script (with confirmation)
node scripts/batch-reset-tables.js [stage]

# Using Node.js force reset script (no confirmation)
node scripts/force-reset-table.js [stage]

# Using Bash script (with confirmation, requires jq)
./scripts/reset-tables.sh [stage]
```

Where `[stage]` is either blank for development or `production` for the production environment.

See [scripts/README.md](scripts/README.md) for more details.
