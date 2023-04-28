import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const householdRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.household.findMany();
  }),
});
