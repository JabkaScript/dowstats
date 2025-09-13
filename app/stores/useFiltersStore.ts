export const useFiltersStore = defineStore('filters', () => {
  const decode = (v: string) => v?.toString()
  const encode = (v: string) => v?.toString()
  const mod = useCookie('mod', { default: () => '1', encode, decode })
  const server = useCookie('server', { default: () => '1', encode, decode })
  const season = useCookie('season', { default: () => '1', encode, decode })
  const mmrType = useCookie('mmr-type', { default: () => 'solo', encode, decode })
  const statsType = useCookie('stats-type', { default: () => 'relic', encode, decode })
  const playerProfileMatchType = useCookie('player-profile-match-type', {
    default: () => '1v1',
    encode,
    decode,
  })

  const relicMatchType = useCookie('relic-match-type', { default: () => '1v1', encode, decode })
  const relicRace = useCookie('relic-race', { default: () => 'all', encode, decode })
  return {
    mod,
    server,
    season,
    mmrType,
    statsType,
    playerProfileMatchType,
    relicMatchType,
    relicRace,
  }
})
