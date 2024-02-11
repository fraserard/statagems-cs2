import { env } from "~/env";
import { type User } from "~/lib/session";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const OPENID_SERVER = "https://steamcommunity.com/openid/login" as const;
const OPENID_URL_PARAMS = {
  "openid.ns": "http://specs.openid.net/auth/2.0",
  "openid.mode": "checkid_setup",
  "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
  "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  "openid.return_to": `${env.NEXT_PUBLIC_API_URL}/auth.steam`,
  "openid.realm": env.WEBSITE_URL,
} as const;

export const authRouter = createTRPCRouter({
  login: publicProcedure.query(({ ctx }) => {
    const OPENID_SERVER = "https://steamcommunity.com/openid/login";

    const params = new URLSearchParams(OPENID_URL_PARAMS);
    ctx.res.redirect(`${OPENID_SERVER}?${params.toString()}`);
  }),

  steam: publicProcedure.query(async ({ ctx }) => {
    const reqParams = ctx.req.query;

    // change openid.mode from id_res to check_authentication
    reqParams["openid.mode"] = "check_authentication";

    // authenticate user via steam openID
    const urlParams = new URLSearchParams(reqParams as Record<string, string>);
    const authCheckResponse = await fetch(
      `${OPENID_SERVER}?${urlParams.toString()}`
    );

    if (!(await authCheckResponse.text()).includes("is_valid:true")) {
      // authentication failed
      console.error("steam openId error");
    }

    const steamId = (reqParams["openid.claimed_id"] as string)
      .split("/id/")
      .pop();

    ctx.session!.user = {
      id: steamId!,
      avatarUrl: "foo",
    };
    await ctx.session?.save();

    ctx.res.redirect(`${env.WEBSITE_URL}`);
  }),

  user: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) {
      return { user: undefined };
    }

    return {
      user: {
        id: ctx.session.user.id,
        avatarUrl: ctx.session.user.avatarUrl,
      } satisfies User,
    };
  }),
});
