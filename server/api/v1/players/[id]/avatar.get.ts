defineRouteMeta({
  openAPI: {
    description:
      'Get player avatar URL by player ID or Steam ID. Returns the large avatar URL for the specified player.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        description: 'Player ID or Steam ID',
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: {
        description: 'Successful response with avatar URL',
        content: {
          'application/json': {
            schema: {
              type: 'string',
              nullable: true,
              description: 'Avatar URL or null if no avatar is set',
            },
          },
        },
      },
      400: {
        description: 'Player not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                statusCode: { type: 'integer', example: 400 },
                statusMessage: { type: 'string', example: 'Player not found' },
              },
            },
          },
        },
      },
    },
  },
})

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const idParam = getRouterParam(event, 'id')
  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Path parameter "id" is required',
    })
  }
  const rows = await db
    .select({
      avatar: tables.players.avatarUrlBig,
    })
    .from(tables.players)
    .where(or(eq(tables.players.id, Number(idParam)), eq(tables.players.sid, idParam)))
    .limit(1)

  if (rows.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Player not found',
    })
  }
  const row = rows[0]
  return row.avatar
})
