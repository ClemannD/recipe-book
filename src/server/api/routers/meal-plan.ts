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

  getLatestMealPlan: authenticatedProcedure.query(async ({ ctx }) => {
    if (!ctx.householdId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be in a household to create a recipe',
      });
    }

    console.log(
      `🔎 Getting latest meal plan for user ${ctx.userId} and householdId ${ctx.householdId}...`
    );
    const mealPlan = await ctx.prisma.mealPlan.findFirst({
      where: {
        householdId: ctx.householdId,
      },
      include: {
        meals: {
          include: {
            recipes: {
              include: {
                recipeTypes: true,
                ingredients: true,
                createdBy: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`🔎 Got meal plan ${JSON.stringify(mealPlan, null, 2)}`);

    return mealPlan;
  }),

  listMealPlans: authenticatedProcedure.query(({ ctx }) => {
    if (!ctx.householdId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be in a household',
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
                ingredients: true,
                createdBy: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
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

  updateMealPlan: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        meals: z.array(
          z.object({
            id: z.string().optional(),
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
        `🔎 Updating meal plan for user ${ctx.userId} and householdId ${
          ctx.householdId ?? ''
        } with input ${JSON.stringify(input, null, 2)}...`
      );
      const mealPlan = await ctx.prisma.mealPlan.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          meals: {
            deleteMany: {
              mealPlanId: input.id,
              NOT: input.meals
                .filter((meal) => meal.id)
                .map((meal) => ({
                  id: meal.id,
                })),
            },
            upsert: input.meals.map((meal) => ({
              where: {
                id: meal.id ?? '',
              },
              create: {
                recipes: {
                  connect: meal.recipeIds.map((recipeId) => ({
                    id: recipeId,
                  })),
                },
              },
              update: {
                recipes: {
                  set: [],
                  connect: meal.recipeIds.map((recipeId) => ({
                    id: recipeId,
                  })),
                },
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
