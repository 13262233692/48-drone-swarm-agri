<template>
  <div class="h-12 flex items-center gap-8 px-6 hud-panel relative border-b border-panel-border" style="z-index: 1000;">
    <div class="flex items-center gap-2">
      <span class="text-info-blue text-xs font-noto">总作业面积</span>
      <span class="font-rajdhani font-bold text-lg glow-blue">{{ summary.totalArea.toFixed(1) }}</span>
      <span class="text-info-blue text-xs">公顷</span>
    </div>
    <div class="w-px h-6 bg-panel-border" />
    <div class="flex items-center gap-2">
      <span class="text-neon-green text-xs font-noto">已覆盖</span>
      <span class="font-rajdhani font-bold text-lg glow-green">{{ summary.coveredArea.toFixed(1) }}</span>
      <span class="text-neon-green text-xs">公顷</span>
    </div>
    <div class="w-px h-6 bg-panel-border" />
    <div class="flex items-center gap-2">
      <span class="text-neon-yellow text-xs font-noto">平均药量</span>
      <span class="font-rajdhani font-bold text-lg" :class="avgLiquidClass">{{ (avgLiquid * 100).toFixed(0) }}%</span>
    </div>
    <div class="w-px h-6 bg-panel-border" />
    <div class="flex items-center gap-2">
      <span class="text-neon-green text-xs font-noto">作业效率</span>
      <span class="font-rajdhani font-bold text-lg glow-green">{{ efficiency.toFixed(1) }}%</span>
    </div>
    <div class="w-px h-6 bg-panel-border" />
    <div class="flex items-center gap-2">
      <span class="text-gray-400 text-xs font-noto">在线</span>
      <span class="font-rajdhani font-bold text-lg text-neon-green">{{ summary.online }}</span>
      <span class="text-gray-400 text-xs">/ {{ summary.total }}</span>
    </div>
    <div class="flex-1" />
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full" :class="connected ? 'bg-neon-green animate-pulse' : 'bg-alarm-red'" />
      <span class="text-xs font-noto" :class="connected ? 'text-neon-green' : 'text-alarm-red'">
        {{ connected ? '已连接' : '断开连接' }}
      </span>
    </div>
    <div class="w-px h-6 bg-panel-border" />
    <router-link to="/fleet" class="text-xs text-info-blue hover:text-neon-green transition-colors font-noto">
      机群列表 →
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFleetStore } from '@/stores/fleet'

const store = useFleetStore()

const summary = computed(() => store.summary)
const avgLiquid = computed(() => store.averageLiquid)
const efficiency = computed(() => store.missionEfficiency)
const connected = computed(() => store.connected)

const avgLiquidClass = computed(() => {
  const v = avgLiquid.value
  if (v < 0.15) return 'glow-red'
  if (v < 0.5) return 'text-neon-yellow'
  return 'glow-green'
})
</script>
