<script setup lang="ts">
import { ref, computed } from 'vue'
import { $fetch } from 'ofetch'

type MmrType = 'solo' | 'team'
type SortDir = 'asc' | 'desc'

interface LadderItem {
  rank: number
  playerId: number
  name: string
  avatarUrl: string | null
  mmr: number | null
}

interface LadderResponse {
  items: LadderItem[]
  meta: {
    modId: number
    seasonId: number | null
    mmrType: MmrType
    sort: SortDir
    page?: number
    pageSize?: number
    total?: number
    totalPages?: number
  }
}

// Новые типы для списков модов, сезонов, серверов
interface ModItem {
  id: number
  name: string
  technicalName: string
  position: number
}
interface ModsResponse { items: ModItem[] }

interface SeasonItem {
  id: number
  seasonName: string
  isActive: number | boolean
}
interface SeasonsResponse { items: SeasonItem[] }

interface ServerItem { id: number; name: string }
interface ServersResponse { items: ServerItem[] }

// Выбранные параметры
const modId = ref<number | ''>('')
const seasonId = ref<string>('')
const serverId = ref<string>('')
const mmrType = ref<MmrType>('solo')
const sort = ref<SortDir>('desc')
const search = ref<string>('')

// Пагинация (вынесем паттерн позже в отдельный файл)
const page = ref<number>(1)
const pageSize = ref<number>(25)
const canPrev = computed(() => page.value > 1)
const canNext = computed(() => (meta.value?.totalPages ? page.value < (meta.value?.totalPages || 1) : items.value.length === pageSize.value))

// Списки для селектов
const mods = ref<ModItem[]>([])
const seasons = ref<SeasonItem[]>([])
const servers = ref<ServerItem[]>([])

const loading = ref(false)
const errorMsg = ref<string>('')
const items = ref<LadderItem[]>([])
const meta = ref<LadderResponse['meta'] | null>(null)

function errorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { statusMessage?: string; message?: string }
    return e.statusMessage || e.message || 'Не удалось загрузить ладдер'
  }
  return 'Не удалось загрузить ладдер'
}

async function fetchMods() {
  const res = await $fetch<ModsResponse>('/api/v1/mods')
  mods.value = res.items
  if ((modId.value === '' || Number.isNaN(Number(modId.value))) && res.items.length) {
    modId.value = res.items[0].id
  }
}

async function fetchSeasons() {
  const res = await $fetch<SeasonsResponse>('/api/v1/seasons')
  seasons.value = res.items
}

async function fetchServers() {
  const res = await $fetch<ServersResponse>('/api/v1/servers')
  servers.value = res.items
}

async function loadLadder() {
  errorMsg.value = ''
  items.value = []
  loading.value = true
  try {
    if (modId.value === '' || Number.isNaN(Number(modId.value))) {
      throw new Error('Укажите корректный ID мода')
    }

    const queryParams: Record<string, string> = {
      mod: String(modId.value),
      mmrType: mmrType.value,
      sort: sort.value,
      page: String(page.value),
      pageSize: String(pageSize.value),
    }
    const s = search.value.trim()
    if (s) queryParams.search = s
    const season = seasonId.value.trim()
    if (season) queryParams.season = season
    const srv = serverId.value.trim()
    if (srv) queryParams.server = srv

    const res = await $fetch<LadderResponse>('/api/v1/ladder', { query: queryParams })
    items.value = res.items
    meta.value = res.meta
  } catch (err: unknown) {
    errorMsg.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}

// Инициализация: сначала списки, затем загрузка ладдера
async function init() {
  try {
    await fetchMods()
    await fetchSeasons()
    await fetchServers()
    await loadLadder()
  } catch (err: unknown) {
    errorMsg.value = errorMessage(err)
  }
}
init()

function onSubmit(e: Event) {
  e.preventDefault()
  page.value = 1 // при изменении фильтров сбрасываем страницу
  loadLadder()
}

function toPrevPage() {
  if (!canPrev.value) return
  page.value -= 1
  loadLadder()
}

function toNextPage() {
  if (!canNext.value) return
  page.value += 1
  loadLadder()
}
</script>

<template>
  <main style="max-width: 960px; margin: 0 auto; padding: 16px;">
    <h1 style="margin: 0 0 16px;">Ладдер игроков</h1>

    <form @submit="onSubmit" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; align-items: end; margin-bottom: 8px;">
      <label style="display: flex; flex-direction: column; gap: 4px;">
        <span>Мод</span>
        <select v-model.number="modId" required style="padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option v-for="m in mods" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </label>

      <label style="display: flex; flex-direction: column; gap: 4px;">
        <span>Сезон</span>
        <select v-model="seasonId" style="padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="">Активный (по умолчанию)</option>
          <option v-for="s in seasons" :key="s.id" :value="String(s.id)">{{ s.id }} — {{ s.seasonName }}{{ s.isActive ? ' (активный)' : '' }}</option>
        </select>
      </label>

      <label style="display: flex; flex-direction: column; gap: 4px;">
        <span>Сервер</span>
        <select v-model="serverId" style="padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="">Все</option>
          <option v-for="s in servers" :key="s.id" :value="String(s.id)">{{ s.name }}</option>
        </select>
      </label>

      <label style="display: flex; flex-direction: column; gap: 4px;">
        <span>Тип MMR</span>
        <select v-model="mmrType" style="padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="solo">solo</option>
          <option value="team">team</option>
        </select>
      </label>

      <label style="display: flex; flex-direction: column; gap: 4px;">
        <span>Сортировка</span>
        <select v-model="sort" style="padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="desc">по убыванию</option>
          <option value="asc">по возрастанию</option>
        </select>
      </label>

      <label style="display: flex; flex-direction: column; gap: 4px; grid-column: span 2;">
        <span>Поиск (имя/ник)</span>
        <input type="text" v-model.trim="search" placeholder="Введите текст..." style="padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;" />
      </label>

      <button type="submit" style="padding: 8px 12px; border: 1px solid #ccc; background: #f5f5f5; border-radius: 4px; cursor: pointer;">Показать</button>
    </form>

    <div style="display: flex; gap: 12px; align-items: center; margin: 8px 0 16px; color: #666; font-size: 14px;">
      <div>
        <span>Текущий сезон API: </span>
        <b>{{ meta?.seasonId ?? '—' }}</b>
      </div>
      <div v-if="meta?.total !== undefined">
        <span>Всего: </span>
        <b>{{ meta?.total }}</b>
        <span> | Страница: </span>
        <b>{{ meta?.page }}</b>
        <span>/</span>
        <b>{{ meta?.totalPages }}</b>
      </div>
    </div>

    <section>
      <div v-if="loading" style="padding: 8px 0;">Загрузка...</div>
      <div v-else-if="errorMsg" style="color: #b00020; padding: 8px 0;">{{ errorMsg }}</div>

      <div v-else>
        <div v-if="items.length === 0" style="padding: 8px 0;">Ничего не найдено.</div>

        <table v-else style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">#</th>
              <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Игрок</th>
              <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">MMR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in items" :key="row.playerId" style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 8px; width: 48px;">{{ row.rank }}</td>
              <td style="padding: 8px; display: flex; align-items: center; gap: 8px;">
                <img v-if="row.avatarUrl" :src="row.avatarUrl" alt="avatar" width="28" height="28" style="border-radius: 50%; object-fit: cover;" />
                <span>{{ row.name }}</span>
              </td>
              <td style="padding: 8px;">{{ row.mmr ?? '-' }}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
          <div style="display: flex; gap: 8px;">
            <button :disabled="!canPrev" @click="toPrevPage" style="padding: 6px 10px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer;">Назад</button>
            <button :disabled="!canNext" @click="toNextPage" style="padding: 6px 10px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer;">Вперёд</button>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>На странице:</span>
            <select v-model.number="pageSize" @change="() => { page = 1; loadLadder() }" style="padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px;">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>