// @ts-check
import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3'
import { $fetch } from 'ofetch'

const BASE_URL = 'https://dow-api.reliclink.com'

// Keys for which the upstream expects a JSON array string in query params
const ARRAY_PARAM_KEYS = new Set(['profile_ids', 'aliases'])

/**
 * Convert values to a JSON array string while preserving numeric IDs as numbers.
 * @param {Array<string | number>} arr
 */
function toJsonArrayString(arr: Array<string | number>) {
  return JSON.stringify(
    arr.map((v) => {
      if (typeof v === 'string' && /^-?\d+$/.test(v.trim())) return Number(v)
      return v
    })
  )
}

/**
 * Detect if a string value is already a JSON array.
 * @param {unknown} val
 */
function isJsonArrayString(val: unknown) {
  if (typeof val !== 'string') return false
  const s = val.trim()
  if (!s.startsWith('[') || !s.endsWith(']')) return false
  try {
    const parsed = JSON.parse(s)
    return Array.isArray(parsed)
  } catch {
    return false
  }
}

/**
 * Normalize query params to satisfy upstream expectations for array-typed params.
 * - Arrays become JSON array strings
 * - Comma-separated strings become JSON array strings
 * - Known array keys with single values are wrapped into a JSON array string
 * - Already JSON array strings are left as-is
 * @param {Record<string, unknown>} query
 */
function transformQuery(query: Record<string, unknown>) {
  /** @type {Record<string, string | number | boolean>} */
  const out: Record<string, string | number | boolean> = {}

  for (const [key, val] of Object.entries(query)) {
    if (val == null) continue

    if (Array.isArray(val)) {
      out[key] = toJsonArrayString(val)
      continue
    }

    if (typeof val === 'string') {
      const s = val.trim()

      if (isJsonArrayString(s)) {
        // Already a JSON array string, pass through
        out[key] = s
      } else if (s.includes(',')) {
        // Comma-separated => JSON array string
        const parts = s
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean)
        out[key] = toJsonArrayString(parts)
      } else if (ARRAY_PARAM_KEYS.has(key)) {
        // Known array key with single value => wrap
        out[key] = toJsonArrayString([s])
      } else {
        out[key] = val
      }
      continue
    }

    // Primitive non-string
    out[key] = val as number | boolean
  }

  return out
}

export default defineEventHandler(async (event) => {
  const path = (getRouterParam(event, 'path') || '').replace(/^\/+|\/+$/g, '')
  const target = `${BASE_URL}/${path}`
  const query = getQuery(event)
  const normalizedQuery = transformQuery(query)

  try {
    const data = await $fetch(target, {
      method: 'GET',
      query: normalizedQuery,
      headers: {
        accept: 'application/json',
      },
    })

    return data
  } catch (err) {
    const anyErr = err as {
      response: { status: number; statusText: string; data: string }
      message: string
    }
    console.log(String(anyErr))
    const statusCode = anyErr?.response?.status || 500
    const statusMessage = anyErr?.response?.statusText || 'Upstream fetch failed'
    const data = anyErr?.response?.data || anyErr?.message || 'Proxy error'
    throw createError({ statusCode, statusMessage, data })
  }
})
