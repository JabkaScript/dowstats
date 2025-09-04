import { desc } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    description: 'Список сезонов. Активный сезон помечен полем isActive = 1.',
    responses: {
      200: { description: 'Успешный ответ' },
    },
  },
})

export default defineEventHandler(async () => {
  const db = useDrizzle()

  const rows = await db
    .select({
      id: tables.seasons.id,
      seasonName: tables.seasons.seasonName,
      isActive: tables.seasons.isActive,
    })
    .from(tables.seasons)
    .orderBy(desc(tables.seasons.isActive), desc(tables.seasons.id))

  return { items: rows }
})