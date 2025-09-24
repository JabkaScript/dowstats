import { relations } from 'drizzle-orm/relations'
import {
  mods,
  modsRaces,
  races,
  banType,
  playersBanned,
  players,
  playersPd,
  playersStats,
  seasons,
  seasonModRacesWinrate,
  servers,
} from './schema'

export const modsRacesRelations = relations(modsRaces, ({ one }) => ({
  mod: one(mods, {
    fields: [modsRaces.modId],
    references: [mods.id],
  }),
  race: one(races, {
    fields: [modsRaces.raceId],
    references: [races.id],
  }),
}))

export const modsRelations = relations(mods, ({ many }) => ({
  modsRaces: many(modsRaces),
  seasonModRacesWinrates: many(seasonModRacesWinrate),
  playersStats: many(playersStats),
}))

export const racesRelations = relations(races, ({ many }) => ({
  modsRaces: many(modsRaces),
  seasonModRacesWinrates: many(seasonModRacesWinrate),
}))

export const playersBannedRelations = relations(playersBanned, ({ one }) => ({
  banType: one(banType, {
    fields: [playersBanned.banType],
    references: [banType.banType],
  }),
  player: one(players, {
    fields: [playersBanned.playerId],
    references: [players.id],
  }),
}))

export const banTypeRelations = relations(banType, ({ many }) => ({
  playersBanneds: many(playersBanned),
}))

export const playersRelations = relations(players, ({ many }) => ({
  playersBanneds: many(playersBanned),
  playersPds: many(playersPd),
  playersStats: many(playersStats),
}))

export const playersPdRelations = relations(playersPd, ({ one }) => ({
  player: one(players, {
    fields: [playersPd.playerId],
    references: [players.id],
  }),
}))

export const playersStatsRelations = relations(playersStats, ({ one }) => ({
  player: one(players, {
    fields: [playersStats.playerId],
    references: [players.id],
  }),
  season: one(seasons, {
    fields: [playersStats.seasonId],
    references: [seasons.id],
  }),
  mod: one(mods, {
    fields: [playersStats.modId],
    references: [mods.id],
  }),
}))

export const seasonModRacesWinrateRelations = relations(seasonModRacesWinrate, ({ one }) => ({
  season: one(seasons, {
    fields: [seasonModRacesWinrate.season],
    references: [seasons.id],
  }),
  mod: one(mods, {
    fields: [seasonModRacesWinrate.mod],
    references: [mods.id],
  }),
  race: one(races, {
    fields: [seasonModRacesWinrate.race],
    references: [races.id],
  }),
  server: one(servers, {
    fields: [seasonModRacesWinrate.server],
    references: [servers.id],
  }),
}))

export const seasonsRelations = relations(seasons, ({ many }) => ({
  seasonModRacesWinrates: many(seasonModRacesWinrate),
  playersStats: many(playersStats),
}))

export const serversRelations = relations(servers, ({ many }) => ({
  seasonModRacesWinrates: many(seasonModRacesWinrate),
}))
