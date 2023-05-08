/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';

import { prisma } from '~/server/db';

type CreateContextOptions = Record<string, never>;

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;

  const authSession = getAuth(req);

  console.log('Context initialized with userId:', authSession.userId);

  const user = authSession.userId
    ? await clerkClient.users.getUser(authSession.userId)
    : null;

  return {
    prisma,
    userId: authSession.userId,
    userFullName:
      user?.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : null,
    householdId: (user?.privateMetadata.householdId ?? null) as string | null,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { clerkClient, getAuth } from '@clerk/nextjs/server';

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

const enforceUserIdAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message:
        '[enforceUserIdAuthenticated] You must be logged in to access this.',
    });
  }

  // Create user row in db if it doesn't exist
  const user = await prisma.user.findUnique({
    where: {
      id: ctx.userId,
    },
  });

  if (!user) {
    await prisma.user.create({
      data: {
        id: ctx.userId,
        fullName: ctx.userFullName,
      },
    });
  } else if (!user.fullName || user.fullName !== ctx.userFullName) {
    console.log(
      `Updating user ${ctx.userId} with full name ${ctx.userFullName || 'null'}`
    );

    await prisma.user.update({
      where: {
        id: ctx.userId,
      },
      data: {
        fullName: ctx.userFullName,
      },
    });
  }

  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

const setUserHouseholdId = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message:
        '[setUserHouseholdId middleware] You must be logged in to access this.',
    });
  }

  let householdId = ctx.householdId;
  if (!householdId) {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.userId,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '[setUserHouseholdId middleware] User not found',
      });
    }

    householdId = user.householdId;

    await clerkClient.users.updateUserMetadata(ctx.userId, {
      privateMetadata: {
        householdId: user.householdId,
      },
    });
  }

  return next({
    ctx: {
      userId: ctx.userId,
      householdId,
    },
  });
});

/**
 * Authenticated procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const authenticatedProcedure = t.procedure
  .use(enforceUserIdAuthenticated)
  .use(setUserHouseholdId);
