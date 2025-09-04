defineRouteMeta({
  openAPI: {
    description: 'Список серверов игры (например, Steam / DoWOnline).',
    responses: { 200: { description: 'Успешный ответ' } },
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