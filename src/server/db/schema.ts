// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  datetime,
  int,
  mysqlEnum,
  mysqlTableCreator,
  primaryKey,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator((name) => `statagems-cs2_${name}`);

/**
 * Player profile
 */
export const player = createTable("player", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  username: varchar("username", { length: 32 }).notNull(),
  role: mysqlEnum("role", ["admin", "referee", "player", "removed"])
    .default("player")
    .notNull(),
  steamId: bigint("steam_id", { mode: "bigint", unsigned: true })
    .unique()
    .notNull(),
  steamUsername: varchar("steam_username", { length: 32 }).notNull(),
  steamAvatarHash: varchar("steam_avatar_hash", { length: 64 }).notNull(),
  steamLastFetched: datetime("steam_last_fetched")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  // team based stats
  gamesWon: int("games_won").default(0).notNull(),
  gamesLost: int("games_lost").default(0).notNull(),
  gamesTied: int("games_tied").default(0).notNull(),
  roundsWon: int("rounds_won").default(0).notNull(),
  roundsLost: int("rounds_lost").default(0).notNull(),
  timesStartedCT: int("times_started_ct").default(0).notNull(),
  timesStartedT: int("times_started_t").default(0).notNull(),

  // individual player stats
  kills: int("kills").default(0).notNull(),
  assists: int("assists").default(0).notNull(),
  deaths: int("deaths").default(0).notNull(),
  adr: smallint("adr"),
  adrCount: int("adr_count").default(0).notNull(), // times an adr stat has been added, for determining average (ideally we don't need this)
  headshotPercentage: smallint("headshot_percentage"),
  score: int("score").default(0).notNull(), // do we even want this
  mvps: int("mvps").default(0).notNull(), // do we even want this
  timesCaptain: int("times_captain").default(0).notNull(),
  lastPlayed: datetime("last_played"),

  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
});

export const playerRelations = relations(player, ({ many }) => ({
  matches: many(matchPlayer),
  teams: many(teamPlayer),
}));

/**
 * Team
 * Only ever 5 players on a team.
 */
export const team = createTable("team", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  teamHash: varchar("team_hash", { length: 55 }).unique().notNull(), // hash of player.ids to identify to unique teams (could be pk instead of id)

  gamesWon: int("games_won").default(0).notNull(),
  gamesLost: int("games_lost").default(0).notNull(),
  gamesTied: int("games_tied").default(0).notNull(),
  roundsWon: int("rounds_won").default(0).notNull(),
  roundsLost: int("rounds_lost").default(0).notNull(),
  timesStartedCT: int("times_started_ct").default(0).notNull(),
  timesStartedT: int("times_started_t").default(0).notNull(),
});

export const teamRelations = relations(team, ({ many }) => ({
  matches: many(matchTeam),
  teamPlayers: many(teamPlayer),
}));

export const match = createTable("match", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  mapFileName: varchar("map_file_name", { length: 32 }).notNull(), // fk to map.filename

  datePlayed: datetime("date_played")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const matchRelations = relations(match, ({ many, one }) => ({
  map: one(map, {
    fields: [match.mapFileName],
    references: [map.fileName],
  }),
  teams: many(matchTeam),
}));

export const matchTeam = createTable(
  "match_team",
  {
    matchId: bigint("match_id", { mode: "number" }), // composite pk, fk to match.id
    teamId: bigint("team_id", { mode: "number" }), // composite pk, fk to team.id
    startSide: mysqlEnum("start_side", ["CT", "T"]),
    captainId: bigint("captain_id", { mode: "number" }), // fk to player.id
    roundsWon: smallint("rounds_won").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.matchId, table.teamId] }),
    };
  }
);

export const matchTeamRelations = relations(matchTeam, ({ many, one }) => ({
  match: one(match, {
    fields: [matchTeam.matchId],
    references: [match.id],
  }),
  team: one(team, {
    fields: [matchTeam.teamId],
    references: [team.id],
  }),
  players: many(matchPlayer),
}));

export const matchPlayer = createTable(
  "match_player",
  {
    matchId: bigint("match_id", { mode: "number" }), // composite pk, fk to match.id
    playerId: bigint("player_id", { mode: "number" }), // composite pk, fk to player.id
    teamId: bigint("team_id", { mode: "number" }), // fk to team.id

    // point in time steam username
    // point in time steam avatar hash

    kills: int("kills").default(0).notNull(),
    assists: int("assists").default(0).notNull(),
    deaths: int("deaths").default(0).notNull(),
    adr: smallint("adr"),
    headshotPercentage: smallint("headshot_percentage"),
    score: int("score").default(0).notNull(), // do we even want this
    mvps: int("mvps").default(0).notNull(), // do we even want this
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.matchId, table.playerId] }),
    };
  }
);

export const matchPlayerRelations = relations(matchPlayer, ({ one }) => ({
  matchTeam: one(matchTeam, {
    fields: [matchPlayer.matchId, matchPlayer.playerId],
    references: [matchTeam.matchId, matchTeam.teamId],
  }),
  player: one(player, {
    fields: [matchPlayer.playerId],
    references: [player.id],
  }),
}));

export const teamPlayer = createTable(
  "team_player",
  {
    teamId: bigint("team_id", { mode: "number" }), // composite pk, fk to team.id
    playerId: bigint("player_id", { mode: "number" }), // composite pk, fk to player.id

    kills: int("kills").default(0).notNull(),
    assists: int("assists").default(0).notNull(),
    deaths: int("deaths").default(0).notNull(),
    adr: smallint("adr"),
    adrCount: int("adr_count").default(0).notNull(), // times an adr stat has been added, for determining average (ideally we don't need this)
    headshotPercentage: smallint("headshot_percentage"),
    score: int("score").default(0).notNull(), // do we even want this
    mvps: int("mvps").default(0).notNull(), // do we even want this
    timesCaptain: int("times_captain").default(0).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.teamId, table.playerId] }),
    };
  }
);

export const teamPlayerRelations = relations(teamPlayer, ({ one }) => ({
  team: one(team, {
    fields: [teamPlayer.teamId],
    references: [team.id],
  }),
  player: one(player, {
    fields: [teamPlayer.playerId],
    references: [player.id],
  }),
}));

export const map = createTable("map", {
  fileName: varchar("file_name", { length: 32 }).primaryKey(),
  mapName: varchar("map_name", { length: 32 }).notNull(),
  isActiveDuty: boolean("is_active_duty").notNull(),
});

export const mapRelations = relations(map, ({ many }) => ({
  matches: many(match),
}));
