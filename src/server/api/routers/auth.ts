import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  login: publicProcedure.query(({ ctx }) => {
    const OPENID_SERVER = "https://steamcommunity.com/openid/login";

    const OPENID_URL_PARAMS = {
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.return_to": "http://localhost:3000/auth/steam",
      "openid.realm": "http://localhost:3000",
    };

    const params = new URLSearchParams(OPENID_URL_PARAMS);
    ctx.res.redirect(`${OPENID_SERVER}?${params.toString()}`);
  }),
});
