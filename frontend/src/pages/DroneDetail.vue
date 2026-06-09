<template>
  <div class="w-full h-full overflow-auto bg-deep-bg p-6">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center gap-4 mb-6">
        <router-link
          to="/"
          class="hud-panel rounded px-4 py-2 text-xs text-info-blue hover:text-neon-green transition-colors font-noto"
        >
          ← 指挥中心
        </router-link>
        <router-link
          to="/fleet"
          class="hud-panel rounded px-4 py-2 text-xs text-info-blue hover:text-neon-green transition-colors font-noto"
        >
          机群列表
        </router-link>
      </div>

      <div v-if="droneInfo" class="flex items-center gap-4 mb-6">
        <div class="w-3 h-3 rounded-full" :class="statusDotClass" />
        <h1 class="font-rajdhani font-bold text-2xl text-neon-green tracking-wider">{{ id }}</h1>
        <span class="text-sm text-gray-400 font-noto">{{ droneInfo.model }}</span>
        <span
          class="px-2 py-0.5 rounded text-[10px] font-noto"
          :class="statusBadgeClass"
        >
          {{ statusLabel }}
        </span>
      </div>

      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="hud-panel rounded p-4 relative">
          <span class="text-[10px] text-gray-500 font-noto">药量</span>
          <div class="mt-2 flex items-end gap-1">
            <span class="font-rajdhani font-bold text-3xl" :style="{ color: liquidColor }">
              {{ liquidPct.toFixed(0) }}
            </span>
            <span class="text-sm mb-1" :style="{ color: liquidColor }">%</span>
          </div>
          <div class="mt-2 h-2 bg-deep-bg rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{ width: liquidPct + '%', backgroundColor: liquidColor }"
            />
          </div>
        </div>

        <div class="hud-panel rounded p-4 relative">
          <span class="text-[10px] text-gray-500 font-noto">高度</span>
          <div class="mt-2 flex items-end gap-1">
            <span class="font-rajdhani font-bold text-3xl text-info-blue">
              {{ telemetry?.altitude?.toFixed(1) ?? '—' }}
            </span>
            <span class="text-sm text-info-blue mb-1">m</span>
          </div>
        </div>

        <div class="hud-panel rounded p-4 relative">
          <span class="text-[10px] text-gray-500 font-noto">速度</span>
          <div class="mt-2 flex items-end gap-1">
            <span class="font-rajdhani font-bold text-3xl text-neon-green">
              {{ telemetry?.speed?.toFixed(1) ?? '—' }}
            </span>
            <span class="text-sm text-neon-green mb-1">m/s</span>
          </div>
        </div>

        <div class="hud-panel rounded p-4 relative">
          <span class="text-[10px] text-gray-500 font-noto">航向</span>
          <div class="mt-2 flex items-end gap-1">
            <span class="font-rajdhani font-bold text-3xl text-neon-yellow">
              {{ telemetry?.heading?.toFixed(0) ?? '—' }}
            </span>
            <span class="text-sm text-neon-yellow mb-1">°</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="hud-panel rounded p-4 relative">
          <span class="text-[10px] text-gray-500 font-noto">当前任务</span>
          <p class="font-rajdhani font-bold text-neon-green mt-1">{{ droneInfo?.currentMission ?? '无' }}</p>
        </div>
        <div class="hud-panel rounded p-4 relative">
          <span class="text-[10px] text-gray-500 font-noto">累计飞行</span>
          <p class="font-rajdhani font-bold text-info-blue mt-1">{{ droneInfo?.totalFlights ?? 0 }} 次</p>
        </div>
        <div class="hud-panel rounded p-4 relative">
          <span class="text-[10px] text-gray-500 font-noto">累计面积</span>
          <p class="font-rajdhani font-bold text-neon-yellow mt-1">{{ droneInfo?.totalArea ?? 0 }} 公顷</p>
        </div>
      </div>

      <div class="hud-panel rounded p-4 mb-6 relative">
        <span class="text-[10px] text-gray-500 font-noto">轨迹地图</span>
        <div ref="miniMapContainer" class="w-full h-64 rounded mt-2 overflow-hidden" />
      </div>

      <div class="hud-panel rounded p-4 relative">
        <span class="text-[10px] text-gray-500 font-noto">告警记录</span>
        <div class="mt-2 space-y-1">
          <div
            v-for="(alarm, i) in droneAlarms"
            :key="i"
            class="flex items-center gap-3 px-3 py-2 bg-dark-surface/60 rounded"
          >
            <div class="w-1.5 h-1.5 rounded-full" :class="alarmTypeColor(alarm.type)" />
            <span class="text-[10px] font-rajdhani text-alarm-red">{{ alarm.type }}</span>
            <span class="text-[10px] text-gray-300 font-noto flex-1">{{ alarm.message }}</span>
            <span class="text-[10px] text-gray-500 font-rajdhani">{{ formatTime(alarm.timestamp) }}</span>
          </div>
          <div v-if="droneAlarms.length === 0" class="text-gray-500 text-xs py-4 text-center font-noto">
            暂无告警
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import { useFleetStore } from '@/stores/fleet'

const props = defineProps<{
  id: string
}>()

const store = useFleetStore()
const miniMapContainer = ref<HTMLElement>()
let miniMap: L.Map | null = null
let trailLayer: L.Polyline | null = null
let marker: L.CircleMarker | null = null

const droneInfo = computed(() => store.getDroneInfo(props.id))
const telemetry = computed(() => store.getDroneTelemetry(props.id))

const liquidPct = computed(() => {
  const t = telemetry.value
  if (!t || t.liquidTotal <= 0) return 0
  return (t.liquidRemain / t.liquidTotal) * 100
})

const liquidColor = computed(() => {
  const pct = liquidPct.value
  if (pct < 15) return '#ff4757'
  if (pct < 50) return '#ffd32a'
  return '#00e5a0'
})

const statusDotClass = computed(() => {
  const s = telemetry.value?.status ?? droneInfo.value?.status ?? 'idle'
  switch (s) {
    case 'flying': return 'bg-neon-green shadow-neon-green'
    case 'returning': return 'bg-info-blue shadow-neon-blue'
    case 'error': return 'bg-alarm-red shadow-neon-red animate-pulse'
    default: return 'bg-gray-500'
  }
})

const statusBadgeClass = computed(() => {
  const s = telemetry.value?.status ?? droneInfo.value?.status ?? 'idle'
  switch (s) {
    case 'flying': return 'bg-neon-green/20 text-neon-green'
    case 'returning': return 'bg-info-blue/20 text-info-blue'
    case 'error': return 'bg-alarm-red/20 text-alarm-red'
    default: return 'bg-gray-500/20 text-gray-400'
  }
})

const statusLabel = computed(() => {
  const s = telemetry.value?.status ?? droneInfo.value?.status ?? 'idle'
  switch (s) {
    case 'flying': return '作业中'
    case 'returning': return '返航'
    case 'error': return '故障'
    case 'idle': return '待命'
    default: return s
  }
})

const droneAlarms = computed(() =>
  store.alarms.filter((a) => a.droneId === props.id).slice(0, 20)
)

onMounted(() => {
  setupMiniMap()
})

onUnmounted(() => {
  if (miniMap) {
    miniMap.remove()
    miniMap = null
  }
})

watch(() => telemetry.value, () => {
  updateMiniMap()
}, { deep: true })

function setupMiniMap() {
  if (!miniMapContainer.value) return

  miniMap = L.map(miniMapContainer.value, {
    center: [28.6, 115.9],
    zoom: 14,
    zoomControl: false,
    attributionControl: false,
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(miniMap)

  updateMiniMap()
}

function updateMiniMap() {
  if (!miniMap || !telemetry.value) return

  const t = telemetry.value
  const latlng = L.latLng(t.lat, t.lng)

  if (marker) miniMap.removeLayer(marker)
  marker = L.circleMarker(latlng, {
    radius: 6,
    fillColor: '#00e5a0',
    fillOpacity: 0.9,
    color: '#00e5a0',
    weight: 2,
  }).addTo(miniMap)

  miniMap.setView(latlng, 15)
}

function alarmTypeColor(type: string): string {
  switch (type) {
    case 'low_liquid': return 'bg-neon-yellow'
    case 'offline': return 'bg-alarm-red'
    case 'geofence_breach': return 'bg-alarm-red'
    case 'altitude_warning': return 'bg-info-blue'
    default: return 'bg-gray-500'
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>
