import { getIronSession, type IronSessionData } from "iron-session";
import { type NextApiRequest, type NextApiResponse } from "next";
import { sessionOptions } from "~/lib/session";
import { getBaseUrl } from "~/utils/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const OPENID_SERVER = "https://steamcommunity.com/openid/login" as const;

  const reqParams = req.query;

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

  const session = await getIronSession<IronSessionData>(
    req,
    res,
    sessionOptions
  );

  session.user = {
    id: steamId!,
    avatarUrl: "foo",
  };
  await session.save();

  res.redirect(`${getBaseUrl()}`);
}
