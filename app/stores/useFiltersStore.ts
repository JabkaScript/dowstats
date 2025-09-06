export const useFiltersStore = defineStore('filters', () => {
  const decode = (v: string) => v?.toString()
  const encode = (v: string) => v?.toString()
  const mod = useCookie('mod', { default: () => '1', encode, decode })
  const server = useCookie('server', { default: () => '1', encode, decode })
  const season = useCookie('season', { default: () => '1', encode, decode })
  const mmrType = useCookie('mmrType', { default: () => 'solo', encode, decode })
  return {
    mod,
    server,
    season,
    mmrType,
  }
})
