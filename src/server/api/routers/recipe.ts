import { z } from 'zod';
import { createTRPCRouter, authenticatedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const recipeRouter = createTRPCRouter({
  getRecipe: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.householdId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be in a household to create a recipe',
        });
      }

      console.log(
        `🔎 Getting recipe with id ${input.id} for user ${
          ctx.userId
        } and householdId ${ctx.householdId ?? ''}...`
      );

      const recipe = await ctx.prisma.recipe.findUnique({
        where: {
          id: input.id,
        },
        include: {
          ingredients: true,
          recipeTypes: true,
        },
      });

      if (!recipe) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Recipe with id ${input.id} not found`,
        });
      }

      return recipe;
    }),

  getRecipes: authenticatedProcedure.query(({ ctx }) => {
    if (!ctx.householdId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be in a household to create a recipe',
      });
    }

    console.log(
      `🔎 Getting recipes for user ${ctx.userId} and householdId ${
        ctx.householdId ?? ''
      }...`
    );

    return ctx.prisma.recipe.findMany({
      where: {
        householdId: ctx.householdId,
      },
      include: {
        ingredients: true,
        recipeTypes: true,
      },
    });
  }),

  createRecipe: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        instructions: z.string().optional(),
        imageUrl: z.string().optional(),
        recipeTypeIds: z.array(z.string()).optional(),
        ingredients: z.array(
          z.object({
            name: z.string().min(1),
            quantity: z.number(),
            unit: z.string().min(1),
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
        `📝 Creating recipe with name ${input.name} for household ${ctx.householdId}...`
      );

      const recipe = await ctx.prisma.recipe.create({
        data: {
          household: {
            connect: {
              id: ctx.householdId,
            },
          },
          name: input.name,
          instructions: input.instructions ?? '',
          imageUrl: input.imageUrl,
          ingredients: {
            create: input.ingredients,
          },
          recipeTypes: {
            connect: input.recipeTypeIds?.map((id) => ({ id })),
          },
          createdBy: {
            connect: {
              id: ctx.userId,
            },
          },
        },
      });

      console.log(`✅ Created recipe ${recipe.id}`);

      return recipe;
    }),

  updateRecipe: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        instructions: z.string().min(1),
        imageUrl: z.string().min(1),
        recipeTypeIds: z.array(z.string()).optional(),
        ingredients: z.array(
          z.object({
            id: z.string().optional(),
            name: z.string().min(1),
            quantity: z.number(),
            unit: z.string().min(1),
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
        `📝 Updating recipe with name ${input.name} for household ${ctx.householdId}...`
      );

      const recipe = await ctx.prisma.recipe.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          instructions: input.instructions,
          imageUrl: input.imageUrl,
          ingredients: {
            deleteMany: {
              recipeId: input.id,
              NOT: input.ingredients
                .filter((ingredient) => ingredient.id)
                .map((ingredient) => ({
                  id: ingredient.id,
                })),
            },
            upsert: input.ingredients.map((ingredient) => ({
              where: {
                id: ingredient.id ?? '',
              },
              create: {
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
              },
              update: {
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
              },
            })),
          },
          recipeTypes: {
            set: [],
            connect: input.recipeTypeIds?.map((id) => ({ id })),
          },
        },
      });

      console.log(`✅ Updated recipe ${recipe.id}`);

      return recipe;
    }),
});
