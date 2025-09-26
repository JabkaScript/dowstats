import {
  mysqlTable,
  primaryKey,
  varchar,
  int,
  index,
  text,
  datetime,
  unique,
  date,
  bigint,
  timestamp,
  float,
  tinyint,
} from 'drizzle-orm/mysql-core'

export const banType = mysqlTable(
  'ban_type',
  {
    banType: varchar('ban_type', { length: 32 }).notNull(),
    description: varchar({ length: 64 }).notNull(),
    isUnranked: int('is_unranked').default(1).notNull(),
  },
  (table) => [primaryKey({ columns: [table.banType], name: 'ban_type_ban_type' })]
)

export const gameRaitings = mysqlTable(
  'game_raitings',
  {
    id: int().notNull(),
    gameId: int('game_id').notNull(),
    lowestMmr: int('lowest_mmr').notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'game_raitings_id' })]
)

export const games = mysqlTable(
  'games',
  {
    id: int().autoincrement().notNull(),
    statsendsid: text(),
    sid1: text(),
    sid2: text(),
    sid3: text(),
    sid4: text(),
    sid5: text(),
    sid6: text(),
    sid7: text(),
    sid8: text(),
    type: int(),
    p1: text(),
    r1: int(),
    p2: text(),
    r2: int(),
    p3: text(),
    r3: int(),
    p4: text(),
    r4: int(),
    p5: text(),
    r5: int(),
    p6: text(),
    r6: int(),
    p7: text(),
    r7: int(),
    p8: text(),
    r8: int(),
    apm1R: int(),
    apm2R: int(),
    apm3R: int(),
    apm4R: int(),
    apm5R: int(),
    apm6R: int(),
    apm7R: int(),
    apm8R: int(),
    w1: text(),
    w2: text(),
    w3: text(),
    w4: text(),
    mmr1: int().notNull(),
    mmr2: int().notNull(),
    mmr3: int().notNull(),
    mmr4: int().notNull(),
    mmr5: int().notNull(),
    mmr6: int().notNull(),
    mmr7: int().notNull(),
    mmr8: int().notNull(),
    map: text(),
    gTime: int(),
    cTime: datetime({ mode: 'string' }),
    gameMod: text('game_mod'),
    modVersion: varchar('mod_version', { length: 32 }).notNull(),
    replayLink: text('replay_link'),
    repDownloadCounter: int('rep_download_counter').default(0),
    ipreal: text(),
    confirmed: tinyint().default(1).notNull(),
    isRate: int('is_rate').default(0).notNull(),
    p1IsCalibrate: int('p1_is_calibrate').default(0).notNull(),
    p2IsCalibrate: int('p2_is_calibrate').default(0).notNull(),
    isExistBanUser: int('is_exist_ban_user').default(0).notNull(),
    isFullStd: int('is_full_std').notNull(),
    baseServerName: varchar('base_server_name', { length: 16 }).default('steam').notNull(),
    baseServerId: varchar('base_server_id', { length: 255 }),
    seasonId: int('season_id').default(1).notNull(),
    rankColumn: int('rank_column'),
    isAuto: tinyint('is_auto').default(0).notNull(),
  },
  (table) => [
    index('cTime').on(table.cTime),
    index('idx_id').on(table.id),
    index('Player names').on(table.p1),
    index('season_id').on(table.seasonId),
    primaryKey({ columns: [table.id], name: 'games_id' }),
  ]
)

export const maps = mysqlTable(
  'maps',
  {
    id: int().autoincrement().notNull(),
    mapName: text('map_name').notNull(),
    ingameName: text('ingame_name').notNull(),
    mapType: int('map_type').notNull(),
    isStandart: tinyint('is_standart').notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'maps_id' })]
)

export const mapsCache = mysqlTable(
  'maps_cache',
  {
    id: int().autoincrement().notNull(),
    totalGames: int('total_games').notNull(),
    mapName: varchar('map_name', { length: 256 }).notNull(),
    r1Win: int(),
    r1Loose: int(),
    r2Win: int(),
    r2Loose: int(),
    r3Win: int(),
    r3Loose: int(),
    r4Win: int(),
    r4Loose: int(),
    r5Win: int(),
    r5Loose: int(),
    r6Win: int(),
    r6Loose: int(),
    r7Win: int(),
    r7Loose: int(),
    r8Win: int(),
    r8Loose: int(),
    r9Win: int(),
    r9Loose: int(),
    r1Pick: int(),
    r2Pick: int(),
    r3Pick: int(),
    r4Pick: int(),
    r5Pick: int(),
    r6Pick: int(),
    r7Pick: int(),
    r8Pick: int(),
    r9Pick: int(),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'maps_cache_id' })]
)

export const mapsracesCache = mysqlTable(
  'mapsraces_cache',
  {
    id: int().autoincrement().notNull(),
    mapid: int(),
    server: varchar({ length: 128 }),
    patch: varchar({ length: 128 }),
    race1Pick: int('race_1_pick'),
    race2Pick: int('race_2_pick'),
    race3Pick: int('race_3_pick'),
    race4Pick: int('race_4_pick'),
    race5Pick: int('race_5_pick'),
    race6Pick: int('race_6_pick'),
    race7Pick: int('race_7_pick'),
    race8Pick: int('race_8_pick'),
    race9Pick: int('race_9_pick'),
    race11SecondWins: int('race_1_1_second_wins'),
    race12FirstWins: int('race_1_2_first_wins'),
    race12SecondWins: int('race_1_2_second_wins'),
    race11FirstWins: int('race_1_1_first_wins'),
    race13SecondWins: int('race_1_3_second_wins'),
    race14FirstWins: int('race_1_4_first_wins'),
    race14SecondWins: int('race_1_4_second_wins'),
    race15FirstWins: int('race_1_5_first_wins'),
    race15SecondWins: int('race_1_5_second_wins'),
    race16FirstWins: int('race_1_6_first_wins'),
    race16SecondWins: int('race_1_6_second_wins'),
    race17FirstWins: int('race_1_7_first_wins'),
    race17SecondWins: int('race_1_7_second_wins'),
    race18FirstWins: int('race_1_8_first_wins'),
    race18SecondWins: int('race_1_8_second_wins'),
    race19FirstWins: int('race_1_9_first_wins'),
    race19SecondWins: int('race_1_9_second_wins'),
    race22FirstWins: int('race_2_2_first_wins'),
    race22SecondWins: int('race_2_2_second_wins'),
    race23FirstWins: int('race_2_3_first_wins'),
    race23SecondWins: int('race_2_3_second_wins'),
    race24FirstWins: int('race_2_4_first_wins'),
    race24SecondWins: int('race_2_4_second_wins'),
    race13FirstWins: int('race_1_3_first_wins'),
    race25SecondWins: int('race_2_5_second_wins'),
    race26FirstWins: int('race_2_6_first_wins'),
    race26SecondWins: int('race_2_6_second_wins'),
    race27FirstWins: int('race_2_7_first_wins'),
    race27SecondWins: int('race_2_7_second_wins'),
    race28FirstWins: int('race_2_8_first_wins'),
    race28SecondWins: int('race_2_8_second_wins'),
    race29FirstWins: int('race_2_9_first_wins'),
    race29SecondWins: int('race_2_9_second_wins'),
    race33FirstWins: int('race_3_3_first_wins'),
    race33SecondWins: int('race_3_3_second_wins'),
    race34FirstWins: int('race_3_4_first_wins'),
    race34SecondWins: int('race_3_4_second_wins'),
    race35FirstWins: int('race_3_5_first_wins'),
    race35SecondWins: int('race_3_5_second_wins'),
    race36FirstWins: int('race_3_6_first_wins'),
    race36SecondWins: int('race_3_6_second_wins'),
    race37FirstWins: int('race_3_7_first_wins'),
    race25FirstWins: int('race_2_5_first_wins'),
    race38FirstWins: int('race_3_8_first_wins'),
    race38SecondWins: int('race_3_8_second_wins'),
    race39FirstWins: int('race_3_9_first_wins'),
    race39SecondWins: int('race_3_9_second_wins'),
    race44FirstWins: int('race_4_4_first_wins'),
    race44SecondWins: int('race_4_4_second_wins'),
    race45FirstWins: int('race_4_5_first_wins'),
    race45SecondWins: int('race_4_5_second_wins'),
    race46FirstWins: int('race_4_6_first_wins'),
    race46SecondWins: int('race_4_6_second_wins'),
    race47FirstWins: int('race_4_7_first_wins'),
    race47SecondWins: int('race_4_7_second_wins'),
    race48FirstWins: int('race_4_8_first_wins'),
    race48SecondWins: int('race_4_8_second_wins'),
    race37SecondWins: int('race_3_7_second_wins'),
    race49SecondWins: int('race_4_9_second_wins'),
    race55FirstWins: int('race_5_5_first_wins'),
    race55SecondWins: int('race_5_5_second_wins'),
    race56FirstWins: int('race_5_6_first_wins'),
    race56SecondWins: int('race_5_6_second_wins'),
    race57FirstWins: int('race_5_7_first_wins'),
    race57SecondWins: int('race_5_7_second_wins'),
    race58FirstWins: int('race_5_8_first_wins'),
    race58SecondWins: int('race_5_8_second_wins'),
    race59FirstWins: int('race_5_9_first_wins'),
    race59SecondWins: int('race_5_9_second_wins'),
    race66FirstWins: int('race_6_6_first_wins'),
    race66SecondWins: int('race_6_6_second_wins'),
    race67FirstWins: int('race_6_7_first_wins'),
    race67SecondWins: int('race_6_7_second_wins'),
    race68FirstWins: int('race_6_8_first_wins'),
    race68SecondWins: int('race_6_8_second_wins'),
    race69FirstWins: int('race_6_9_first_wins'),
    race69SecondWins: int('race_6_9_second_wins'),
    race77FirstWins: int('race_7_7_first_wins'),
    race77SecondWins: int('race_7_7_second_wins'),
    race49FirstWins: int('race_4_9_first_wins'),
    race78FirstWins: int('race_7_8_first_wins'),
    race78SecondWins: int('race_7_8_second_wins'),
    race79FirstWins: int('race_7_9_first_wins'),
    race79SecondWins: int('race_7_9_second_wins'),
    race88FirstWins: int('race_8_8_first_wins'),
    race88SecondWins: int('race_8_8_second_wins'),
    race89FirstWins: int('race_8_9_first_wins'),
    race89SecondWins: int('race_8_9_second_wins'),
    race99FirstWins: int('race_9_9_first_wins'),
    race99SecondWins: int('race_9_9_second_wins'),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dateStart: date('date_start', { mode: 'string' }),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dateEnd: date('date_end', { mode: 'string' }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: 'mapsraces_cache_id' }),
    unique('race_cache_id_uindex').on(table.id),
  ]
)

export const minMaxRanks = mysqlTable(
  'min_max_ranks',
  {
    seasonId: int('season_id').notNull(),
    modId: int('mod_id').notNull(),
    minMmr: int('min_mmr'),
    maxMmr: int('max_mmr'),
  },
  (table) => [
    primaryKey({ columns: [table.seasonId, table.modId], name: 'min_max_ranks_season_id_mod_id' }),
  ]
)

export const mods = mysqlTable(
  'mods',
  {
    id: int().autoincrement().notNull(),
    name: varchar({ length: 128 }).notNull(),
    technicalName: varchar('technical_name', { length: 128 }).notNull(),
    position: int().notNull(),
    visible: tinyint().default(1).notNull(),
    visibleInWinrateTable: tinyint('visible_in_winrate_table').default(1).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'mods_id' })]
)

export const modsRaces = mysqlTable(
  'mods_races',
  {
    modId: int('mod_id')
      .notNull()
      .references(() => mods.id),
    raceId: int('race_id')
      .notNull()
      .references(() => races.id),
    id: bigint({ mode: 'number' }).autoincrement().notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'mods_races_id' })]
)

export const playerMapStats = mysqlTable(
  'player_map_stats',
  {
    id: int().autoincrement().notNull(),
    playerId: varchar('player_id', { length: 20 }).notNull(),
    mapName: varchar('map_name', { length: 100 }).notNull(),
    gameType: varchar('game_type', { length: 10 }).notNull(),
    raceId: int('race_id').default(-1).notNull(),
    modId: int('mod_id').default(1).notNull(),
    seasonId: int('season_id').default(-1).notNull(),
    totalGames: int('total_games').default(0).notNull(),
    wins: int().default(0).notNull(),
    losses: int().default(0).notNull(),
    lastUpdated: timestamp('last_updated', { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('idx_game_type').on(table.gameType),
    index('idx_map_name').on(table.mapName),
    index('idx_map_stats_lookup').on(
      table.mapName,
      table.gameType,
      table.raceId,
      table.modId,
      table.seasonId
    ),
    index('idx_mod_season').on(table.modId, table.seasonId),
    index('idx_player_id').on(table.playerId),
    index('idx_player_stats_lookup').on(
      table.playerId,
      table.gameType,
      table.raceId,
      table.modId,
      table.seasonId,
      table.totalGames
    ),
    index('idx_race_id').on(table.raceId),
    index('idx_race_stats_lookup').on(table.raceId, table.gameType, table.modId, table.seasonId),
    index('idx_total_games').on(table.totalGames),
    primaryKey({ columns: [table.id], name: 'player_map_stats_id' }),
    unique('unique_player_map_stats').on(
      table.playerId,
      table.mapName,
      table.gameType,
      table.raceId,
      table.modId,
      table.seasonId
    ),
  ]
)

export const playerSkill = mysqlTable(
  'player_skill',
  {
    id: int().autoincrement().notNull(),
    name: text().notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'player_skill_id' })]
)

export const players = mysqlTable(
  'players',
  {
    id: int().autoincrement().notNull(),
    serverId: int('server_id').default(1).notNull(),
    name: text(),
    lastNicknames: text('last_nicknames'),
    avatarUrl: text('avatar_url'),
    avatarUrlBig: text('avatar_url_big').notNull(),
    time: int().default(0),
    sid: bigint({ mode: 'number' }),
    apm: float().notNull(),
    apmGameCounter: int('apm_game_counter').default(0).notNull(),
    p1IsCalibrate: int('p1_is_calibrate').default(0).notNull(),
    p2IsCalibrate: int('p2_is_calibrate').default(0).notNull(),
    lastActive: datetime('last_active', { mode: 'string' }),
    lastUpdateTime: datetime('last_update_time', { mode: 'string' }).notNull(),
  },
  (table) => [
    index('idx_players_server_id_id').on(table.serverId, table.id),
    index('sid').on(table.sid),
    primaryKey({ columns: [table.id], name: 'players_id' }),
    unique('sid_2').on(table.sid),
  ]
)

export const playersBanned = mysqlTable(
  'players_banned',
  {
    id: int().autoincrement().notNull(),
    playerId: int('player_id')
      .notNull()
      .references(() => players.id),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dateStart: date('date_start', { mode: 'string' }),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dateEnd: date('date_end', { mode: 'string' }),
    reason: text(),
    banType: varchar('ban_type', { length: 32 })
      .default('cheater')
      .references(() => banType.banType),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: 'players_banned_id' }),
    unique('players_banned_id_uindex').on(table.id),
  ]
)

export const playersPd = mysqlTable(
  'players_pd',
  {
    id: int().autoincrement().notNull(),
    playerId: int('player_id')
      .notNull()
      .references(() => players.id),
    ip: varchar({ length: 15 }).notNull(),
    machineUniqueId: varchar('machine_unique_id', { length: 36 }),
  },
  (table) => [
    index('machine_unique_id').on(table.machineUniqueId),
    primaryKey({ columns: [table.id], name: 'players_pd_id' }),
    unique('id').on(table.id),
    unique('player_id').on(table.playerId, table.ip, table.machineUniqueId),
  ]
)

export const playersStats = mysqlTable(
  'players_stats',
  {
    id: int().autoincrement().notNull(),
    playerId: int('player_id')
      .notNull()
      .references(() => players.id),
    seasonId: int('season_id')
      .notNull()
      .references(() => seasons.id),
    modId: int('mod_id')
      .notNull()
      .references(() => mods.id),
    modVersion: text('mod_version'),
    '1X11': int('1x1_1').default(0).notNull(),
    '1X11W': int('1x1_1w').default(0).notNull(),
    '1X12': int('1x1_2').default(0).notNull(),
    '1X12W': int('1x1_2w').default(0).notNull(),
    '1X13': int('1x1_3').default(0).notNull(),
    '1X13W': int('1x1_3w').default(0).notNull(),
    '1X14': int('1x1_4').default(0).notNull(),
    '1X14W': int('1x1_4w').default(0).notNull(),
    '1X15': int('1x1_5').default(0).notNull(),
    '1X15W': int('1x1_5w').default(0).notNull(),
    '1X16': int('1x1_6').default(0).notNull(),
    '1X16W': int('1x1_6w').default(0).notNull(),
    '1X17': int('1x1_7').default(0).notNull(),
    '1X17W': int('1x1_7w').default(0).notNull(),
    '1X18': int('1x1_8').default(0).notNull(),
    '1X18W': int('1x1_8w').default(0).notNull(),
    '1X19': int('1x1_9').default(0).notNull(),
    '1X19W': int('1x1_9w').default(0).notNull(),
    '2X21': int('2x2_1').default(0).notNull(),
    '2X21W': int('2x2_1w').default(0).notNull(),
    '2X22': int('2x2_2').default(0).notNull(),
    '2X22W': int('2x2_2w').default(0).notNull(),
    '2X23': int('2x2_3').default(0),
    '2X23W': int('2x2_3w').default(0).notNull(),
    '2X24': int('2x2_4').default(0),
    '2X24W': int('2x2_4w').default(0).notNull(),
    '2X25': int('2x2_5').default(0).notNull(),
    '2X25W': int('2x2_5w').default(0).notNull(),
    '2X26': int('2x2_6').default(0).notNull(),
    '2X26W': int('2x2_6w').default(0).notNull(),
    '2X27': int('2x2_7').default(0).notNull(),
    '2X27W': int('2x2_7w').default(0).notNull(),
    '2X28': int('2x2_8').default(0).notNull(),
    '2X28W': int('2x2_8w').default(0).notNull(),
    '2X29': int('2x2_9').default(0).notNull(),
    '2X29W': int('2x2_9w').default(0).notNull(),
    '3X31': int('3x3_1').default(0).notNull(),
    '3X31W': int('3x3_1w').default(0).notNull(),
    '3X32': int('3x3_2').default(0).notNull(),
    '3X32W': int('3x3_2w').default(0).notNull(),
    '3X33': int('3x3_3').default(0).notNull(),
    '3X33W': int('3x3_3w').default(0).notNull(),
    '3X34': int('3x3_4').default(0).notNull(),
    '3X34W': int('3x3_4w').default(0).notNull(),
    '3X35': int('3x3_5').default(0).notNull(),
    '3X35W': int('3x3_5w').default(0).notNull(),
    '3X36': int('3x3_6').default(0).notNull(),
    '3X36W': int('3x3_6w').default(0).notNull(),
    '3X37': int('3x3_7').default(0).notNull(),
    '3X37W': int('3x3_7w').default(0).notNull(),
    '3X38': int('3x3_8').default(0).notNull(),
    '3X38W': int('3x3_8w').default(0).notNull(),
    '3X39': int('3x3_9').default(0).notNull(),
    '3X39W': int('3x3_9w').default(0).notNull(),
    '4X41': int('4x4_1').default(0).notNull(),
    '4X41W': int('4x4_1w').default(0).notNull(),
    '4X42': int('4x4_2').default(0).notNull(),
    '4X42W': int('4x4_2w').default(0).notNull(),
    '4X43': int('4x4_3').default(0).notNull(),
    '4X43W': int('4x4_3w').default(0).notNull(),
    '4X44': int('4x4_4').default(0).notNull(),
    '4X44W': int('4x4_4w').default(0).notNull(),
    '4X45': int('4x4_5').default(0).notNull(),
    '4X45W': int('4x4_5w').default(0).notNull(),
    '4X46': int('4x4_6').default(0).notNull(),
    '4X46W': int('4x4_6w').default(0).notNull(),
    '4X47': int('4x4_7').default(0).notNull(),
    '4X47W': int('4x4_7w').default(0).notNull(),
    '4X48': int('4x4_8').default(0).notNull(),
    '4X48W': int('4x4_8w').default(0).notNull(),
    '4X49': int('4x4_9').default(0).notNull(),
    '4X49W': int('4x4_9w').default(0).notNull(),
    mmr: int().default(1500).notNull(),
    overallMmr: int('overall_mmr').default(1500).notNull(),
    maxMmr: int('max_mmr').default(1500).notNull(),
    maxOverallMmr: int('max_overall_mmr').notNull(),
    customGamesMmr: int('custom_games_mmr').default(1500).notNull(),
  },
  (table) => [
    index('idx_ps_mod_season_mmr').on(table.modId, table.seasonId, table.mmr),
    index('idx_ps_mod_season_overall_mmr').on(table.modId, table.seasonId, table.overallMmr),
    index('mmr').on(table.mmr),
    index('mmr_2').on(table.mmr),
    index('overall_mmr').on(table.overallMmr),
    primaryKey({ columns: [table.id], name: 'players_stats_id' }),
    unique('player_id').on(table.playerId, table.seasonId, table.modId),
  ]
)

export const races = mysqlTable(
  'races',
  {
    id: int().autoincrement().notNull(),
    name: text().notNull(),
    shortName: text('short_name').notNull(),
    url: text(),
    urlGif: text('url_gif'),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'races_id' })]
)

export const racesCache = mysqlTable(
  'races_cache',
  {
    id: int().autoincrement().notNull(),
    server: varchar({ length: 128 }),
    patch: varchar({ length: 128 }),
    race1Pick: int('race_1_pick'),
    race2Pick: int('race_2_pick').notNull(),
    race3Pick: int('race_3_pick').notNull(),
    race4Pick: int('race_4_pick').notNull(),
    race5Pick: int('race_5_pick').notNull(),
    race6Pick: int('race_6_pick').notNull(),
    race7Pick: int('race_7_pick').notNull(),
    race8Pick: int('race_8_pick').notNull(),
    race9Pick: int('race_9_pick').notNull(),
    race11SecondWins: int('race_1_1_second_wins'),
    race12FirstWins: int('race_1_2_first_wins'),
    race12SecondWins: int('race_1_2_second_wins'),
    race11FirstWins: int('race_1_1_first_wins'),
    race13SecondWins: int('race_1_3_second_wins'),
    race14FirstWins: int('race_1_4_first_wins'),
    race14SecondWins: int('race_1_4_second_wins'),
    race15FirstWins: int('race_1_5_first_wins'),
    race15SecondWins: int('race_1_5_second_wins'),
    race16FirstWins: int('race_1_6_first_wins'),
    race16SecondWins: int('race_1_6_second_wins'),
    race17FirstWins: int('race_1_7_first_wins'),
    race17SecondWins: int('race_1_7_second_wins'),
    race18FirstWins: int('race_1_8_first_wins'),
    race18SecondWins: int('race_1_8_second_wins'),
    race19FirstWins: int('race_1_9_first_wins'),
    race19SecondWins: int('race_1_9_second_wins'),
    race22FirstWins: int('race_2_2_first_wins'),
    race22SecondWins: int('race_2_2_second_wins'),
    race23FirstWins: int('race_2_3_first_wins'),
    race23SecondWins: int('race_2_3_second_wins'),
    race24FirstWins: int('race_2_4_first_wins'),
    race24SecondWins: int('race_2_4_second_wins'),
    race13FirstWins: int('race_1_3_first_wins'),
    race25SecondWins: int('race_2_5_second_wins'),
    race26FirstWins: int('race_2_6_first_wins'),
    race26SecondWins: int('race_2_6_second_wins'),
    race27FirstWins: int('race_2_7_first_wins'),
    race27SecondWins: int('race_2_7_second_wins'),
    race28FirstWins: int('race_2_8_first_wins'),
    race28SecondWins: int('race_2_8_second_wins'),
    race29FirstWins: int('race_2_9_first_wins'),
    race29SecondWins: int('race_2_9_second_wins'),
    race33FirstWins: int('race_3_3_first_wins'),
    race33SecondWins: int('race_3_3_second_wins'),
    race34FirstWins: int('race_3_4_first_wins'),
    race34SecondWins: int('race_3_4_second_wins'),
    race35FirstWins: int('race_3_5_first_wins'),
    race35SecondWins: int('race_3_5_second_wins'),
    race36FirstWins: int('race_3_6_first_wins'),
    race36SecondWins: int('race_3_6_second_wins'),
    race37FirstWins: int('race_3_7_first_wins'),
    race25FirstWins: int('race_2_5_first_wins'),
    race38FirstWins: int('race_3_8_first_wins'),
    race38SecondWins: int('race_3_8_second_wins'),
    race39FirstWins: int('race_3_9_first_wins'),
    race39SecondWins: int('race_3_9_second_wins'),
    race44FirstWins: int('race_4_4_first_wins'),
    race44SecondWins: int('race_4_4_second_wins'),
    race45FirstWins: int('race_4_5_first_wins'),
    race45SecondWins: int('race_4_5_second_wins'),
    race46FirstWins: int('race_4_6_first_wins'),
    race46SecondWins: int('race_4_6_second_wins'),
    race47FirstWins: int('race_4_7_first_wins'),
    race47SecondWins: int('race_4_7_second_wins'),
    race48FirstWins: int('race_4_8_first_wins'),
    race48SecondWins: int('race_4_8_second_wins'),
    race37SecondWins: int('race_3_7_second_wins'),
    race49SecondWins: int('race_4_9_second_wins'),
    race55FirstWins: int('race_5_5_first_wins'),
    race55SecondWins: int('race_5_5_second_wins'),
    race56FirstWins: int('race_5_6_first_wins'),
    race56SecondWins: int('race_5_6_second_wins'),
    race57FirstWins: int('race_5_7_first_wins'),
    race57SecondWins: int('race_5_7_second_wins'),
    race58FirstWins: int('race_5_8_first_wins'),
    race58SecondWins: int('race_5_8_second_wins'),
    race59FirstWins: int('race_5_9_first_wins'),
    race59SecondWins: int('race_5_9_second_wins'),
    race66FirstWins: int('race_6_6_first_wins'),
    race66SecondWins: int('race_6_6_second_wins'),
    race67FirstWins: int('race_6_7_first_wins'),
    race67SecondWins: int('race_6_7_second_wins'),
    race68FirstWins: int('race_6_8_first_wins'),
    race68SecondWins: int('race_6_8_second_wins'),
    race69FirstWins: int('race_6_9_first_wins'),
    race69SecondWins: int('race_6_9_second_wins'),
    race77FirstWins: int('race_7_7_first_wins'),
    race77SecondWins: int('race_7_7_second_wins'),
    race49FirstWins: int('race_4_9_first_wins'),
    race78FirstWins: int('race_7_8_first_wins'),
    race78SecondWins: int('race_7_8_second_wins'),
    race79FirstWins: int('race_7_9_first_wins'),
    race79SecondWins: int('race_7_9_second_wins'),
    race88FirstWins: int('race_8_8_first_wins'),
    race88SecondWins: int('race_8_8_second_wins'),
    race89FirstWins: int('race_8_9_first_wins'),
    race89SecondWins: int('race_8_9_second_wins'),
    race99FirstWins: int('race_9_9_first_wins'),
    race99SecondWins: int('race_9_9_second_wins'),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dateStart: date('date_start', { mode: 'string' }),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    dateEnd: date('date_end', { mode: 'string' }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: 'races_cache_id' }),
    unique('race_cache_id_uindex').on(table.id),
  ]
)

export const seasonModRacesWinrate = mysqlTable(
  'season_mod_races_winrate',
  {
    id: bigint({ mode: 'number' }).autoincrement().notNull(),
    server: int()
      .notNull()
      .references(() => servers.id, { onUpdate: 'cascade' }),
    season: int()
      .notNull()
      .references(() => seasons.id, { onUpdate: 'cascade' }),
    mod: int()
      .notNull()
      .references(() => mods.id, { onUpdate: 'cascade' }),
    race: int()
      .notNull()
      .references(() => races.id, { onUpdate: 'cascade' }),
    skillLevel: int('skill_level').notNull(),
    games: bigint({ mode: 'number' }).notNull(),
    race1Win: bigint('race_1_win', { mode: 'number' }),
    race1Games: bigint('race_1_games', { mode: 'number' }),
    race2Win: bigint('race_2_win', { mode: 'number' }),
    race2Games: bigint('race_2_games', { mode: 'number' }),
    race3Win: bigint('race_3_win', { mode: 'number' }),
    race3Games: bigint('race_3_games', { mode: 'number' }),
    race4Win: bigint('race_4_win', { mode: 'number' }),
    race4Games: bigint('race_4_games', { mode: 'number' }),
    race5Win: bigint('race_5_win', { mode: 'number' }),
    race5Games: bigint('race_5_games', { mode: 'number' }),
    race6Win: bigint('race_6_win', { mode: 'number' }),
    race6Games: bigint('race_6_games', { mode: 'number' }),
    race7Win: bigint('race_7_win', { mode: 'number' }),
    race7Games: bigint('race_7_games', { mode: 'number' }),
    race8Win: bigint('race_8_win', { mode: 'number' }),
    race8Games: bigint('race_8_games', { mode: 'number' }),
    race9Win: bigint('race_9_win', { mode: 'number' }),
    race9Games: bigint('race_9_games', { mode: 'number' }),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    dateStart: timestamp('date_start', { mode: 'string' }).defaultNow().notNull(),
    dateEnd: timestamp('date_end', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index('mod').on(table.mod),
    index('race').on(table.race),
    index('season').on(table.season),
    index('server').on(table.server),
    index('skill_level').on(table.skillLevel),
    primaryKey({ columns: [table.id], name: 'season_mod_races_winrate_id' }),
  ]
)

export const seasons = mysqlTable(
  'seasons',
  {
    id: int().autoincrement().notNull(),
    seasonName: varchar('season_name', { length: 32 }).notNull(),
    isActive: int('is_active').default(0).notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'seasons_id' })]
)

export const servers = mysqlTable(
  'servers',
  {
    id: int().autoincrement().notNull(),
    name: varchar({ length: 32 }).notNull(),
  },
  (table) => [unique('id').on(table.id)]
)

export const steamIdToUpdate = mysqlTable(
  'steam_id_to_update',
  {
    steamId: bigint('steam_id', { mode: 'number' }).notNull(),
  },
  (table) => [unique('steam_id').on(table.steamId)]
)

export const steamIdUpdateCounter = mysqlTable('steam_id_update_counter', {
  counter: int().notNull(),
})

export const temp = mysqlTable('temp', {
  id: int().default(0).notNull(),
})

export const urlLogs = mysqlTable(
  'url_logs',
  {
    id: int().autoincrement().notNull(),
    url: text(),
    replayInfo: text('replay_info'),
    queryInfo: text('query_info'),
    cTime: datetime({ mode: 'string' }),
  },
  (table) => [primaryKey({ columns: [table.id], name: 'url_logs_id' })]
)
