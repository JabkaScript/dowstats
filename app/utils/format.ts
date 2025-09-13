export function removeMatchType(name: string) {
  return name.replace(/\d+v\d+_/g, '')
}
export function formatBoardName(name: string) {
  const nameNormalized = name.replaceAll('_', ' ').replace('race', '').trim()
  switch (nameNormalized) {
    case 'chaos marine':
      return 'race.chaos_marine'
    case 'dark eldar':
      return 'race.dark_eldar'
    case 'eldar':
      return 'race.eldar'
    case 'guard':
      return 'race.guard'
    case 'necron':
      return 'race.necron'
    case 'ork':
      return 'race.ork'
    case 'sisters':
      return 'race.sisters'
    case 'space marine':
      return 'race.space_marine'
    case 'tau':
      return 'race.tau'
    default:
      return nameNormalized
  }
}
