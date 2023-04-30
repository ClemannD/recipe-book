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

      console.log(`✅ Created household ${household.id}`);

      return household;
    }),
});
