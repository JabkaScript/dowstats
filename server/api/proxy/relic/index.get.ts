// @ts-check
import { defineEventHandler } from 'h3'

export default defineEventHandler(() => ({
  message: 'Relic proxy is up. Use /api/proxy/relic/<path>',
}))
