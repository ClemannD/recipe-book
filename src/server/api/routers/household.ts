import { z } from 'zod';
import { authenticatedProcedure, createTRPCRouter } from '~/server/api/trpc';

export const householdRouter = createTRPCRouter({
  getCurrentUserHousehold: authenticatedProcedure.query(({ ctx }) => {
    return ctx.prisma.household.findFirst({
      where: {
        users: {
          some: {
            id: ctx.userId,
          },
        },
      },
    });
  }),

  createHousehold: authenticatedProcedure
    .input(
      z.object({
        householdName: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(
        `Creating household with name ${input.householdName} for user ${ctx.userId}...`
      );

      const household = await ctx.prisma.household.create({
        data: {
          name: input.householdName,
          users: {
            connect: {
              id: ctx.userId,
            },
          },
        },
      });

      const defaultRecipeTypes = [
        {
          name: 'Breakfast',
          icon: '🍳',
        },
        {
          name: 'Beef',
          icon: '🥩',
        },
        {
          name: 'Chicken',
          icon: '🍗',
        },
        {
          name: 'Pork',
          icon: '🐷',
        },
        {
          name: 'Fish',
          icon: '🐟',
        },
        {
          name: 'Veggies',
          icon: '🥦',
        },
        {
          name: 'Dessert',
          icon: '🍨',
        },
        {
          name: 'Potato',
          icon: '🥔',
        },
        {
          name: 'Pasta',
          icon: '🍝',
        },
        {
          name: 'Soup',
          icon: '🍲',
        },
        {
          name: 'Salad',
          icon: '🥗',
        },
        {
          name: 'Sandwich',
          icon: '🥪',
        },
        {
          name: 'Sauce',
          icon: '🥣',
        },
        {
          name: 'Shrimp',
          icon: '🍤',
        },
        {
          name: 'Turkey',
          icon: '🦃',
        },
        {
          name: 'Rice',
          icon: '🍚',
        },
        {
          name: 'Asian',
          icon: '🍱',
        },
        {
          name: 'Mexican',
          icon: '🌮',
        },
        {
          name: 'Italian',
          icon: '🍕',
        },
        {
          name: 'Cheesy',
          icon: '🧀',
        },
      ];

      // Create default recipeTypes for the household
      await ctx.prisma.recipeType.createMany({
        data: defaultRecipeTypes.map((recipeType) => ({
          ...recipeType,
          householdId: household.id,
          userId: ctx.userId,
        })),
      });

      console.log(`✅ Created household ${household.id}`);

      return household;
    }),
});
