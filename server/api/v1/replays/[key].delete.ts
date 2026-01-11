import { defineEventHandler, createError } from 'h3'
import { deleteReplay } from '~~/server/utils/s3'

defineRouteMeta({
  openAPI: {
    summary: 'Delete replay from S3',
    description: 'Deletes replay object by key.',
    tags: ['Replays'],
  },
})

export default defineEventHandler(async (event) => {
  const key = event.context.params?.key
  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'Missing replay key in path' })
  }

  await deleteReplay(key)

  return { ok: true }
})
