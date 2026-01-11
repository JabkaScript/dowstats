import { useRuntimeConfig } from '#imports'

export interface SteamPlayerSummary {
  steamid: string
  personaname: string
  avatar?: string
  avatarmedium?: string
  avatarfull?: string
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

export async function fetchSteamProfiles(
  steamIds: string[]
): Promise<Record<string, SteamPlayerSummary>> {
  const ids = Array.from(new Set(steamIds.map((s) => s.trim()).filter(Boolean)))
  if (ids.length === 0) return {}

  const cfg = useRuntimeConfig()
  const apiKey = cfg?.steamApiKey || process.env.NUXT_STEAM_API_KEY
  if (!apiKey) {
    return {}
  }

  const base = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/'
  const result: Record<string, SteamPlayerSummary> = {}

  for (const group of chunk(ids, 100)) {
    const url = `${base}?key=${encodeURIComponent(apiKey)}&steamids=${group.join(',')}`
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) continue
      const json = (await res.json()) as { response?: { players?: SteamPlayerSummary[] } }
      const players = json?.response?.players || []
      for (const p of players) {
        if (!p?.steamid) continue
        result[p.steamid] = p
      }
    } catch {
      // ignore network/parse errors per batch to be resilient
    }
  }

  return result
}

export function pickAvatars(p: SteamPlayerSummary): {
  small?: string
  medium?: string
  full?: string
} {
  return {
    small: p.avatar,
    medium: p.avatarmedium || p.avatar,
    full: p.avatarfull || p.avatarmedium || p.avatar,
  }
}
