<template>
  <div class="w-[240px] h-full hud-panel relative flex flex-col border-l border-panel-border overflow-hidden" style="z-index: 1000;">
    <div class="px-4 py-3 border-b border-panel-border">
      <h2 class="font-rajdhani font-bold text-info-blue text-sm tracking-wider uppercase">药量监控</h2>
    </div>

    <div class="flex-1 overflow-y-auto px-3 py-3 space-y-2">
      <div
        v-for="drone in droneList"
        :key="drone.droneId"
        class="flex items-center gap-2"
        :class="{ 'animate-pulse': isLowLiquid(drone) }"
      >
        <span class="font-rajdhani text-[10px] text-gray-400 w-16 truncate">{{ drone.droneId }}</span>
        <div class="flex-1 h-5 bg-deep-bg rounded-sm overflow-hidden relative">
          <div
            class="h-full rounded-sm transition-all duration-500"
            :style="{
              width: liquidPercent(drone) + '%',
              background: liquidGradient(drone),
            }"
          />
          <span class="absolute inset-0 flex items-center justify-center font-rajdhani text-[10px] font-bold"
            :style="{ color: liquidPercent(drone) < 15 ? '#fff' : '#0a0e1a' }">
            {{ liquidPercent(drone).toFixed(0) }}%
          </span>
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

const store = useFleetStore()

const droneList = computed(() => {
  const list: DroneTelemetry[] = []
  store.drones.forEach((d) => list.push(d))
  return list.sort((a, b) => {
    const pa = liquidPercent(a)
    const pb = liquidPercent(b)
    return pa - pb
  })
})

function isLowLiquid(d: DroneTelemetry): boolean {
  return d.liquidTotal > 0 && d.liquidRemain / d.liquidTotal < 0.15
}

function liquidPercent(d: DroneTelemetry): number {
  if (d.liquidTotal <= 0) return 0
  return (d.liquidRemain / d.liquidTotal) * 100
}

function liquidGradient(d: DroneTelemetry): string {
  const pct = liquidPercent(d)
  if (pct < 15) return 'linear-gradient(180deg, #ff4757, #ff6b81)'
  if (pct < 50) return 'linear-gradient(180deg, #ffd32a, #ffbe00)'
  return 'linear-gradient(180deg, #00e5a0, #00b87a)'
}
</script>
