<template>
  <div class="w-full h-full overflow-auto bg-deep-bg p-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="font-rajdhani font-bold text-2xl text-neon-green tracking-wider">机群列表</h1>
          <p class="text-xs text-gray-500 font-noto mt-1">共 {{ totalDrones }} 架无人机</p>
        </div>
        <router-link
          to="/"
          class="hud-panel rounded px-4 py-2 text-xs text-info-blue hover:text-neon-green transition-colors font-noto"
        >
          ← 返回指挥中心
        </router-link>
      </div>

      <div class="flex items-center gap-2 mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-4 py-1.5 rounded text-xs font-noto transition-all"
          :class="activeTab === tab.key
            ? 'bg-neon-green/20 text-neon-green border border-neon-green/40 shadow-neon-green'
            : 'bg-dark-surface text-gray-400 border border-panel-border hover:border-neon-green/20'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <div class="hud-panel rounded overflow-hidden">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-panel-border bg-dark-surface">
              <th
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-3 text-left font-rajdhani font-semibold text-gray-400 cursor-pointer hover:text-neon-green transition-colors"
                @click="sortBy(col.key)"
              >
                {{ col.label }}
                <span v-if="sortKey === col.key" class="text-info-blue ml-1">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="drone in filteredDrones"
              :key="drone.droneId"
              class="border-b border-panel-border/30 hover:bg-panel-border/20 cursor-pointer transition-colors"
              @click="goToDetail(drone.droneId)"
            >
              <td class="px-4 py-3 font-rajdhani font-semibold text-info-blue">{{ drone.droneId }}</td>
              <td class="px-4 py-3 font-noto text-gray-300">{{ drone.model }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-noto"
                  :class="statusBadgeClass(drone.status)"
                >
                  {{ statusLabel(drone.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-16 h-1.5 bg-deep-bg rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full"
                      :style="{ width: drone.liquidPct + '%', backgroundColor: liquidColor(drone.liquidPct) }"
                    />
                  </div>
                  <span class="font-rajdhani" :style="{ color: liquidColor(drone.liquidPct) }">
                    {{ drone.liquidPct.toFixed(0) }}%
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 font-rajdhani text-gray-300">{{ drone.altitude.toFixed(1) }}m</td>
              <td class="px-4 py-3 font-rajdhani text-gray-300">{{ drone.speed.toFixed(1) }}m/s</td>
              <td class="px-4 py-3 font-rajdhani text-gray-400">
                {{ drone.lat.toFixed(4) }}, {{ drone.lng.toFixed(4) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredDrones.length === 0" class="text-center py-12 text-gray-500 font-noto text-sm">
          暂无数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFleetStore } from '@/stores/fleet'

const router = useRouter()
const store = useFleetStore()

const activeTab = ref('all')
const sortKey = ref<string>('droneId')
const sortOrder = ref<'asc' | 'desc'>('asc')

interface TableRow {
  droneId: string
  model: string
  status: string
  liquidPct: number
  altitude: number
  speed: number
  lat: number
  lng: number
}

const columns = [
  { key: 'droneId', label: '编号' },
  { key: 'model', label: '型号' },
  { key: 'status', label: '状态' },
  { key: 'liquidPct', label: '药量' },
  { key: 'altitude', label: '高度' },
  { key: 'speed', label: '速度' },
  { key: 'position', label: '位置' },
]

const totalDrones = computed(() => store.droneInfos.size)

const allRows = computed<TableRow[]>(() => {
  const rows: TableRow[] = []
  store.droneInfos.forEach((info) => {
    const telemetry = store.drones.get(info.droneId)
    rows.push({
      droneId: info.droneId,
      model: info.model,
      status: telemetry?.status ?? info.status,
      liquidPct: telemetry && telemetry.liquidTotal > 0
        ? (telemetry.liquidRemain / telemetry.liquidTotal) * 100
        : 0,
      altitude: telemetry?.altitude ?? 0,
      speed: telemetry?.speed ?? 0,
      lat: telemetry?.lat ?? 0,
      lng: telemetry?.lng ?? 0,
    })
  })
  return rows
})

const tabs = computed(() => [
  { key: 'all', label: '全部', count: allRows.value.length },
  { key: 'online', label: '在线', count: allRows.value.filter((r) => r.status !== 'error').length },
  { key: 'low_liquid', label: '低药量', count: allRows.value.filter((r) => r.liquidPct < 15).length },
  { key: 'error', label: '故障', count: allRows.value.filter((r) => r.status === 'error').length },
])

const filteredDrones = computed(() => {
  let list = [...allRows.value]

  if (activeTab.value === 'online') list = list.filter((r) => r.status !== 'error')
  else if (activeTab.value === 'low_liquid') list = list.filter((r) => r.liquidPct < 15)
  else if (activeTab.value === 'error') list = list.filter((r) => r.status === 'error')

  list.sort((a, b) => {
    const key = sortKey.value as keyof TableRow
    const aVal = a[key]
    const bVal = b[key]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
    }
    const cmp = String(aVal).localeCompare(String(bVal))
    return sortOrder.value === 'asc' ? cmp : -cmp
  })

  return list
})

function sortBy(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

function goToDetail(droneId: string) {
  router.push({ name: 'drone-detail', params: { id: droneId } })
}

function liquidColor(pct: number): string {
  if (pct < 15) return '#ff4757'
  if (pct < 50) return '#ffd32a'
  return '#00e5a0'
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'flying': return 'bg-neon-green/20 text-neon-green'
    case 'returning': return 'bg-info-blue/20 text-info-blue'
    case 'error': return 'bg-alarm-red/20 text-alarm-red'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'flying': return '作业中'
    case 'returning': return '返航'
    case 'error': return '故障'
    case 'idle': return '待命'
    default: return status
  }
}
</script>
