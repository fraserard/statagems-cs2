import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input, ctx }) => {
      if (ctx.session?.user) return { greeting: ctx.session.user.id };

      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // await ctx.db.insert(player).values({
      //   steamId: input.name,
      // });
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.player.findFirst({
      orderBy: (player, { desc }) => [desc(player.createdAt)],
    });
  }),
});
