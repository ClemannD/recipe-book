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
});
