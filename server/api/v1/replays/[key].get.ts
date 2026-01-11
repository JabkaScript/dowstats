import { defineEventHandler, createError, sendStream, getQuery } from 'h3'
import { getReplayStream } from '~~/server/utils/s3'

defineRouteMeta({
  openAPI: {
    summary: 'Stream replay file from S3',
    description:
      'Streams replay contents directly as octet-stream. Optional query `filename` sets Content-Disposition filename.',
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
  if (filename) {
    event.node.res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  } else {
    event.node.res.setHeader('Content-Disposition', 'attachment')
  }
  event.node.res.setHeader('Content-Type', 'application/octet-stream')

  const stream = await getReplayStream(key)
  return sendStream(event, stream as any)
})
