import { z } from "zod";

export async function getPlayersFromSteam(
  steamApiKey: string,
  steamIds: string[]
) {
  const steamApi = new SteamApi(steamApiKey);

  const steamPlayersData = await steamApi.getPlayerSummaries(steamIds);

  return steamPlayersData.map((player) => ({
    steamId: player.steamid,
    steamUsername: player.personaname,
    steamAvatarHash: player.avatarhash,
  }));
}

const PlayerSummariesSchema = z.object({
  response: z.object({
    players: z.array(
      z.object({
        steamid: z.string(),
        communityvisibilitystate: z.number(),
        profilestate: z.number(),
        personaname: z.string(),
        commentpermission: z.number(),
        profileurl: z.string(),
        avatar: z.string(),
        avatarmedium: z.string(),
        avatarfull: z.string(),
        avatarhash: z.string(),
        lastlogoff: z.number(),
        personastate: z.number(),
        realname: z.string().optional(),
        primaryclanid: z.string(),
        timecreated: z.number(),
        personastateflags: z.number(),
        loccountrycode: z.string(),
        locstatecode: z.string(),
      })
    ),
  }),
});

export class SteamApi {
  private steamApiKey: string;

  constructor(steamApiKey: string) {
    this.steamApiKey = steamApiKey;
  }

  async getPlayerSummaries(steamIds: string[]) {
    if (steamIds.length > 99) {
      throw new Error("steamIds length must be 99 or lower");
    }

    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${
        this.steamApiKey
      }&steamids=${steamIds.join(",")}`
    );

    if (res.status === 403) {
      throw new Error("SteamAPI access forbidden. Check your SteamAPI key.");
    }

    const resJson = PlayerSummariesSchema.parse(await res.json());

    return resJson.response.players;
  }
}
