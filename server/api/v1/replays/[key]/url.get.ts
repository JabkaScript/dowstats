import { defineEventHandler, createError, getQuery } from 'h3'
import { getReplaySignedUrl } from '~~/server/utils/s3'

defineRouteMeta({
  openAPI: {
    summary: 'Get presigned URL for replay',
    description:
      'Generates temporary signed download URL. Optional `filename` and `expiresIn` (seconds).',
    tags: ['Replays'],
  },
})

export default defineEventHandler(async (event) => {
  const key = event.context.params?.key
  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Missing replay key in path' })
  }

  const query = getQuery(event)
  const filename = typeof query.filename === 'string' ? query.filename : undefined
  const expiresIn = query.expiresIn ? Number(query.expiresIn) : 900

  const url = await getReplaySignedUrl(key, filename, Number.isNaN(expiresIn) ? 900 : expiresIn)

  return { ok: true, url }
})
