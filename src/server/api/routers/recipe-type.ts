import { z } from 'zod';
import { authenticatedProcedure, createTRPCRouter } from '../trpc';
import { TRPCError } from '@trpc/server';

export const recipeTypeRouter = createTRPCRouter({
  getRecipeTypes: authenticatedProcedure.query(async ({ ctx }) => {
    const recipeTypes = await ctx.prisma.recipeType.findMany({
      where: {
        householdId: ctx.householdId,
      },
    });

    return recipeTypes.sort((a, b) => a.name.localeCompare(b.name));
  }),

  createRecipeType: authenticatedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(30),
        icon: z.string().emoji(),
        color: z.string().optional(),
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
        `📝 Creating recipe type with name ${input.name} for household ${ctx.householdId}...`
      );

      const recipeType = await ctx.prisma.recipeType.create({
        data: {
          name: input.name,
          icon: input.icon,
          color: input.color,
          household: {
            connect: {
              id: ctx.householdId,
            },
          },
          createdBy: {
            connect: {
              id: ctx.userId,
            },
          },
        },
      });

      console.log(`✅ Created recipe type ${recipeType.id}`);

      return recipeType;
    }),

  updateRecipeType: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(30).optional(),
        icon: z.string().emoji().optional(),
        color: z.string().optional(),
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
        `📝 Updates recipe type with is ${input.id} for household ${ctx.householdId}...`
      );

      const recipeType = await ctx.prisma.recipeType.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          icon: input.icon,
          color: input.color,
        },
      });

      console.log(`✅ Updated recipe type ${recipeType.id}`);

      return recipeType;
    }),

  deleteRecipeType: authenticatedProcedure
    .input(
      z.object({
        id: z.string(),
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
        `📝 Deleting recipe type with is ${input.id} for household ${ctx.householdId}...`
      );

      const recipeType = await ctx.prisma.recipeType.delete({
        where: {
          id: input.id,
        },
      });

      console.log(`✅ Deleted recipe type ${recipeType.id}`);

      return recipeType;
    }),
});
