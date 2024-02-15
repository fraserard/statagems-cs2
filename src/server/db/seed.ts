import { Client } from "@planetscale/database";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import * as schema from "./schema";

dotenv.config({ path: "./.env" });

export const db = drizzle(
  new Client({
    url: process.env.DATABASE_URL,
  }).connection(),
  { schema }
);

await seedMaps();

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
