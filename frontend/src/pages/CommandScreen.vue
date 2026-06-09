<template>
  <div class="w-full h-full relative flex flex-col">
    <StatsBar />

    <div class="flex-1 relative flex overflow-hidden">
      <FleetPanel @select="onDroneSelect" />

      <div class="flex-1 relative">
        <div ref="mapContainer" class="absolute inset-0" />

        <FarmBoundary :map="mapInstance!" />
        <DroneMapLayer :map="mapInstance!" />
        <VoronoiCells :map="mapInstance!" />

        <div
          v-if="store.lastReschedule"
          class="absolute top-3 left-1/2 -translate-x-1/2 hud-panel rounded px-4 py-2 border border-neon-green/40"
          style="z-index: 1000;"
        >
          <div class="text-[11px] font-rajdhani font-bold text-neon-green">
            ⚡ 编队重构完成 — {{ store.lastReschedule.assignments?.length || 0 }} 架存活无人机接管 {{ store.lastReschedule.reassignedArea?.toFixed(1) || 0 }} 公顷
          </div>
          <div class="text-[9px] text-gray-400 font-noto">
            故障机: {{ store.lastReschedule.failedDroneId }}
          </div>
        </div>

        <div
          v-if="alarms.length > 0"
          class="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2"
          style="z-index: 1000;"
        >
          <div
            v-for="(alarm, i) in alarms.slice(0, 5)"
            :key="i"
            class="hud-panel rounded px-3 py-2 flex items-center gap-2 shrink-0 border border-alarm-red/30"
          >
            <div class="w-2 h-2 rounded-full bg-alarm-red animate-pulse" />
            <span class="text-[10px] text-alarm-red font-rajdhani font-bold">{{ alarm.droneId }}</span>
            <span class="text-[10px] text-gray-300 font-noto">{{ alarm.message }}</span>
            <span class="text-[10px] text-gray-500 font-rajdhani">{{ formatTime(alarm.timestamp) }}</span>
          </div>
        </div>

        <div class="absolute top-3 right-3 flex flex-col gap-1" style="z-index: 1000;">
          <button
            class="hud-panel rounded px-3 py-2 text-[10px] font-rajdhani font-bold text-alarm-red hover:bg-alarm-red/20 transition-colors border border-alarm-red/40 animate-pulse"
            @click="simulateCrash"
          >
            💥 模拟炸机
          </button>
          <button
            v-for="drone in trackedDrones"
            :key="drone.droneId"
            class="hud-panel rounded px-2 py-1 text-[10px] font-rajdhani text-neon-green hover:bg-panel-border/50 transition-colors"
            @click="focusDrone(drone)"
          >
            ⊕ {{ drone.droneId }}
          </button>
        </div>
      </div>

      <LiquidPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import L from 'leaflet'
import { useFleetStore } from '@/stores/fleet'
import StatsBar from '@/components/StatsBar.vue'
import FleetPanel from '@/components/FleetPanel.vue'
import LiquidPanel from '@/components/LiquidPanel.vue'
import FarmBoundary from '@/components/FarmBoundary.vue'
import DroneMapLayer from '@/components/DroneMapLayer.vue'
import VoronoiCells from '@/components/VoronoiCells.vue'
import type { DroneTelemetry, LeafMap } from '@/shared/types'

const mapContainer = ref<HTMLElement>()
const mapInstance = ref<LeafMap | null>(null)
const store = useFleetStore()

const alarms = computed(() => store.alarms)

const trackedDrones = computed(() => {
  const list: DroneTelemetry[] = []
  store.drones.forEach((d) => {
    if (d.status === 'flying' || d.status === 'error') list.push(d)
  })
  return list.slice(0, 8)
})

onMounted(() => {
  if (!mapContainer.value) return

  const map = L.map(mapContainer.value, {
    center: [28.6, 115.9],
    zoom: 14,
    zoomControl: true,
    attributionControl: true,
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB',
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(map)

  mapInstance.value = map

  setTimeout(() => map.invalidateSize(), 100)
})

onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.remove()
    mapInstance.value = null
  }
})

function onDroneSelect(droneId: string) {
  const drone = store.drones.get(droneId)
  if (drone && mapInstance.value) {
    mapInstance.value.flyTo([drone.lat, drone.lng], 16, { duration: 1 })
  }
}

function focusDrone(drone: DroneTelemetry) {
  if (mapInstance.value) {
    mapInstance.value.flyTo([drone.lat, drone.lng], 16, { duration: 0.8 })
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function simulateCrash() {
  const droneIds: string[] = []
  store.drones.forEach((d) => {
    if (d.status === 'flying') droneIds.push(d.droneId)
  })
  if (droneIds.length === 0) return
  const target = droneIds[Math.floor(Math.random() * droneIds.length)]
  store.simulateCrash(target)
}
</script>
