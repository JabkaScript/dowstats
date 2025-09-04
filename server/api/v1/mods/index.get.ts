

defineRouteMeta({
  openAPI: {
    description: 'List of available mods (only visible ones).',
    responses: {
      200: {
        description: 'Successful response',
      },
    },
  },
})

export default defineEventHandler(async () => {
  const db = useDrizzle()

  const rows = await db
    .select({
      id: tables.mods.id,
      name: tables.mods.name,
      technicalName: tables.mods.technicalName,
      position: tables.mods.position,
    })
    .from(tables.mods)
    .where(eq(tables.mods.visible, 1))
    .orderBy(tables.mods.position)

  return { items: rows }
})