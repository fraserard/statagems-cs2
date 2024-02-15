import { Client } from "@planetscale/database";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { getPlayersFromSteam } from "~/server/helpers/steam";
import * as schema from "./schema";

async function main() {
  await seedAdmin();
  await seedMaps();
}

async function seedAdmin() {
  console.log("Seeding admin");

  await db.delete(schema.player);

  const steamId = process.env.ADMIN_STEAM_ID;

  const admin = (
    await getPlayersFromSteam(process.env.STEAM_API_KEY!, [steamId!])
  )[0];

  await db.insert(schema.player).values({
    username: admin!.steamUsername,
    steamId: BigInt(admin!.steamId),
    steamUsername: admin!.steamUsername,
    steamAvatarHash: admin!.steamAvatarHash,
    role: "admin",
  });

  console.log("Seeding admin complete");
}

async function seedMaps() {
  console.log("Seeding maps");

  await db.delete(schema.map);

  await db.insert(schema.map).values([
    {
      fileName: "de_mirage",
      mapName: "Mirage",
      isActiveDuty: true,
    },
    {
      fileName: "de_inferno",
      mapName: "Inferno",
      isActiveDuty: true,
    },
    {
      fileName: "de_overpass",
      mapName: "Overpass",
      isActiveDuty: true,
    },
    {
      fileName: "de_nuke",
      mapName: "Nuke",
      isActiveDuty: true,
    },
    {
      fileName: "de_vertigo",
      mapName: "Vertigo",
      isActiveDuty: true,
    },
    {
      fileName: "de_ancient",
      mapName: "Ancient",
      isActiveDuty: true,
    },
    {
      fileName: "de_anubis",
      mapName: "Anubis",
      isActiveDuty: true,
    },
  ]);

  console.log("Seeding maps complete");
}

dotenv.config({ path: "./.env" });

const db = drizzle(
  new Client({
    url: process.env.DATABASE_URL,
  }).connection(),
  { schema }
);

await main();
