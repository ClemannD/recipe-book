import { createTRPCRouter } from '~/server/api/trpc';
import { householdRouter } from './routers/household';
import { recipeRouter } from './routers/recipe';
import { recipeTypeRouter } from './routers/recipe-type';
import { mealPlanRouter } from './routers/meal-plan';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  household: householdRouter,
  recipe: recipeRouter,
  recipeType: recipeTypeRouter,
  mealPlan: mealPlanRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
