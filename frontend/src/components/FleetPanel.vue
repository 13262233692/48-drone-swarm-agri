<template>
  <div class="w-[280px] h-full hud-panel relative flex flex-col border-r border-panel-border overflow-hidden" style="z-index: 1000;">
    <div class="px-4 py-3 border-b border-panel-border">
      <h2 class="font-rajdhani font-bold text-neon-green text-sm tracking-wider uppercase">机群状态</h2>
    </div>

    <div class="grid grid-cols-3 gap-2 px-3 py-3 border-b border-panel-border">
      <div class="flex flex-col items-center bg-dark-surface rounded p-2">
        <span class="font-rajdhani font-bold text-lg text-neon-green">{{ onlineCount }}</span>
        <span class="text-[10px] text-gray-400 font-noto">在线</span>
      </div>
      <div class="flex flex-col items-center bg-dark-surface rounded p-2">
        <span class="font-rajdhani font-bold text-lg text-neon-yellow">{{ lowLiquidCount }}</span>
        <span class="text-[10px] text-gray-400 font-noto">低药量</span>
      </div>
      <div class="flex flex-col items-center bg-dark-surface rounded p-2">
        <span class="font-rajdhani font-bold text-lg text-alarm-red">{{ errorCount }}</span>
        <span class="text-[10px] text-gray-400 font-noto">故障</span>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
      <div
        v-for="drone in droneList"
        :key="drone.droneId"
        class="bg-dark-surface/60 rounded px-3 py-2 cursor-pointer hover:bg-panel-border/40 transition-all border border-transparent"
        :class="{ 'border-alarm-red/50': drone.status === 'error', 'border-neon-yellow/30': isLowLiquid(drone) }"
        @click="$emit('select', drone.droneId)"
      >
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" :class="statusDotClass(drone.status)" />
            <span class="font-rajdhani font-semibold text-xs">{{ drone.droneId }}</span>
          </div>
          <span class="text-[10px] font-noto" :class="statusTextClass(drone.status)">{{ statusLabel(drone.status) }}</span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex-1">
            <div class="h-1.5 bg-deep-bg rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="{ width: liquidPercent(drone) + '%', backgroundColor: liquidColor(drone) }"
              />
            </div>
          </div>
          <span class="font-rajdhani text-[10px]" :style="{ color: liquidColor(drone) }">
            {{ liquidPercent(drone).toFixed(0) }}%
          </span>
        </div>
        <div class="flex items-center justify-between mt-1">
          <span class="text-[10px] text-gray-500 font-noto">高度</span>
          <span class="font-rajdhani text-[10px] text-gray-300">{{ drone.altitude.toFixed(1) }}m</span>
        </div>
      </div>

      <div v-if="droneList.length === 0" class="text-center text-gray-500 text-xs py-8 font-noto">
        等待数据...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFleetStore } from '@/stores/fleet'
import type { DroneTelemetry } from '@/shared/types'

defineEmits<{
  select: [droneId: string]
}>()

const store = useFleetStore()

const droneList = computed(() => {
  const list: DroneTelemetry[] = []
  store.drones.forEach((d) => list.push(d))
  return list.sort((a, b) => {
    if (a.status === 'error' && b.status !== 'error') return -1
    if (a.status !== 'error' && b.status === 'error') return 1
    return a.droneId.localeCompare(b.droneId)
  })
})

const onlineCount = computed(() => store.summary.online)
const lowLiquidCount = computed(() => store.summary.lowLiquid)
const errorCount = computed(() => store.summary.error)

function isLowLiquid(d: DroneTelemetry): boolean {
  return d.liquidTotal > 0 && d.liquidRemain / d.liquidTotal < 0.15
}

function liquidPercent(d: DroneTelemetry): number {
  if (d.liquidTotal <= 0) return 0
  return (d.liquidRemain / d.liquidTotal) * 100
}

function liquidColor(d: DroneTelemetry): string {
  const pct = liquidPercent(d)
  if (pct < 15) return '#ff4757'
  if (pct < 50) return '#ffd32a'
  return '#00e5a0'
}

function statusDotClass(status: DroneTelemetry['status']): string {
  switch (status) {
    case 'flying': return 'bg-neon-green shadow-neon-green'
    case 'returning': return 'bg-info-blue shadow-neon-blue'
    case 'error': return 'bg-alarm-red shadow-neon-red animate-pulse'
    default: return 'bg-gray-500'
  }
}

function statusTextClass(status: DroneTelemetry['status']): string {
  switch (status) {
    case 'flying': return 'text-neon-green'
    case 'returning': return 'text-info-blue'
    case 'error': return 'text-alarm-red'
    default: return 'text-gray-400'
  }
}

function statusLabel(status: DroneTelemetry['status']): string {
  switch (status) {
    case 'flying': return '作业中'
    case 'returning': return '返航'
    case 'error': return '故障'
    case 'idle': return '待命'
    default: return status
  }
}
</script>
