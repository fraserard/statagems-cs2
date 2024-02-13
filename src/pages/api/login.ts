import { type NextApiRequest, type NextApiResponse } from "next";
import { getBaseUrl } from "~/utils/api";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const OPENID_SERVER = "https://steamcommunity.com/openid/login" as const;

  const OPENID_URL_PARAMS = {
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.return_to": `${getBaseUrl()}/api/auth`,
    "openid.realm": getBaseUrl(),
  };

  const params = new URLSearchParams(OPENID_URL_PARAMS);
  res.redirect(`${OPENID_SERVER}?${params.toString()}`);
}
