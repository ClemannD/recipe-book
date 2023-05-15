import { z } from 'zod';
import { authenticatedProcedure, createTRPCRouter } from '../trpc';
import { TRPCError } from '@trpc/server';

export const mealPlanRouter = createTRPCRouter({
  getMealPlan: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.householdId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be in a household to create a recipe',
        });
      }
      console.log(
        `🔎 Getting meal plan with id ${input.id} for user ${
          ctx.userId
        } and householdId ${ctx.householdId ?? ''}...`
      );
      const mealPlan = await ctx.prisma.mealPlan.findUnique({
        where: {
          id: input.id,
        },
        include: {
          meals: {
            include: {
              recipes: {
                include: {
                  recipeTypes: true,
                },
              },
            },
          },
        },
      });
      if (!mealPlan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Meal plan with id ${input.id} not found`,
        });
      }
      return mealPlan;
    }),

  getMealPlans: authenticatedProcedure.query(({ ctx }) => {
    if (!ctx.householdId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be in a household to create a recipe',
      });
    }
    console.log(
      `🔎 Getting meal plans for user ${ctx.userId} and householdId ${
        ctx.householdId ?? ''
      }...`
    );
    const mealPlans = ctx.prisma.mealPlan.findMany({
      where: {
        householdId: ctx.householdId,
      },
      include: {
        meals: {
          include: {
            recipes: {
              include: {
                recipeTypes: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
    return mealPlans;
  }),

  createMealPlan: authenticatedProcedure
    .input(
      z.object({
        name: z.string(),
        meals: z.array(
          z.object({
            recipeIds: z.array(z.string()),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.householdId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be in a household to create a recipe',
        });
      }
      console.log(
        `🔎 Creating meal plan for user ${ctx.userId} and householdId ${
          ctx.householdId ?? ''
        } with input ${JSON.stringify(input, null, 2)}...`
      );
      const mealPlan = await ctx.prisma.mealPlan.create({
        data: {
          name: input.name,
          householdId: ctx.householdId,
          meals: {
            create: input.meals.map((meal) => ({
              recipes: {
                connect: meal.recipeIds.map((recipeId) => ({
                  id: recipeId,
                })),
              },
            })),
          },
        },
        include: {
          meals: {
            include: {
              recipes: {
                include: {
                  recipeTypes: true,
                },
              },
            },
          },
        },
      });
      return mealPlan;
    }),
});
