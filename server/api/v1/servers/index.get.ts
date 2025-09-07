defineRouteMeta({
  openAPI: {
    description: 'List of game servers (e.g., Steam / DoWOnline).',
    responses: { 200: { description: 'Successful response' } },
  },
})

export default defineEventHandler(async () => {
  const db = useDrizzle()

  const rows = await db
    .select({ id: tables.servers.id, name: tables.servers.name })
    .from(tables.servers)
    .orderBy(tables.servers.id)

  return { items: rows }
})
