import "react-router";

declare module "react-router" {
  // Replace this with your actual AppLoadContext type if you have one
  interface AppLoadContext {
    // Example property: replace with your actual context properties
    // env: Record<string, string>; 
    // session: Session;
  }

  // You can remove these augmentations once you've fully migrated
  // to using the `context` property from Route.LoaderArgs/Route.ActionArgs
  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  interface ActionFunctionArgs {
    context: AppLoadContext;
  }
} 