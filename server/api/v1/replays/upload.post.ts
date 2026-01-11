import { defineEventHandler, createError, readMultipartFormData, getQuery } from 'h3'
import { makeReplayKey, uploadReplay } from '~~/server/utils/s3'

defineRouteMeta({
  openAPI: {
    summary: 'Upload replay file to S3',
    description:
      'Accepts multipart/form-data with `file` and `game_id`, saves to S3 as `<name>#<game_id>.rec>`',
    tags: ['Replays'],
  },
})

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Multipart form-data is required' })
  }

  const filePart = parts.find((p) => 'filename' in p && p.filename)
  if (!filePart || !('data' in filePart)) {
    throw createError({ statusCode: 400, statusMessage: 'File part is missing' })
  }

  const gameIdPart = parts.find((p) => p.name === 'game_id')
  const query = getQuery(event)
  const gameId =
    gameIdPart && 'data' in gameIdPart
      ? Number(Buffer.from((gameIdPart as any).data).toString('utf8'))
      : query.game_id
        ? Number(query.game_id)
        : undefined
  if (!gameId || Number.isNaN(gameId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Parameter `game_id` is required (multipart field or query)',
    })
  }

  const originalName = (filePart as any).filename as string
  const data: Buffer = (filePart as any).data as Buffer
  const key = makeReplayKey(originalName || 'replay.rec', gameId)

  await uploadReplay(key, data)

  return {
    ok: true,
    key,
  }
})
