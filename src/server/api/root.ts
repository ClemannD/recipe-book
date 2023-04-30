import { createTRPCRouter } from '~/server/api/trpc';
import { householdRouter } from './routers/household';
import { recipeRouter } from './routers/recipe';
import { recipeTypeRouter } from './routers/recipeType';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  household: householdRouter,
  recipe: recipeRouter,
  recipeType: recipeTypeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
