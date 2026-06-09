<template>
  <div ref="pixiContainer" class="absolute inset-0 pointer-events-none" style="z-index: 450;" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import * as PIXI from 'pixi.js'
import { useFleetStore } from '@/stores/fleet'
import type { DroneTelemetry, LeafMap } from '@/shared/types'

const props = defineProps<{
  map: any
}>()

const pixiContainer = ref<HTMLElement>()
const store = useFleetStore()

let app: PIXI.Application | null = null
let container: PIXI.Container | null = null
const droneGraphics = new Map<string, { container: PIXI.Container; ring: PIXI.Graphics; dot: PIXI.Graphics; arrow: PIXI.Graphics; trail: PIXI.Graphics }>()
const trajectoryBuffers = new Map<string, { lat: number; lng: number; timestamp: number }[]>()
const TRAJECTORY_MAX = 500
let animFrameId: number = 0
let lastTime = 0

const DRONE_COLORS = Array.from({ length: 50 }, (_, i) => {
  const hue = (i * 360 / 50) % 360
  const s = 90
  const l = 60
  const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1))
  const m = l / 100 - c / 2
  let r = 0, g = 0, b = 0
  if (hue < 60) { r = c; g = x; b = 0 }
  else if (hue < 120) { r = x; g = c; b = 0 }
  else if (hue < 180) { r = 0; g = c; b = x }
  else if (hue < 240) { r = 0; g = x; b = c }
  else if (hue < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  const ri = Math.round((r + m) * 255)
  const gi = Math.round((g + m) * 255)
  const bi = Math.round((b + m) * 255)
  return (ri << 16) | (gi << 8) | bi
})

function getDroneColor(index: number): number {
  return DRONE_COLORS[index % DRONE_COLORS.length]
}

function latLngToPixel(lat: number, lng: number): { x: number; y: number } {
  if (!props.map) return { x: 0, y: 0 }
  const point = props.map.latLngToContainerPoint([lat, lng])
  return { x: point.x, y: point.y }
}

function createDroneGraphic(droneId: string, index: number) {
  const c = new PIXI.Container()
  const color = getDroneColor(index)

  const ring = new PIXI.Graphics()
  ring.lineStyle(1.5, color, 0.4)
  ring.drawCircle(0, 0, 14)
  c.addChild(ring)

  const dot = new PIXI.Graphics()
  dot.beginFill(color, 0.9)
  dot.drawCircle(0, 0, 6)
  dot.endFill()
  c.addChild(dot)

  const arrow = new PIXI.Graphics()
  arrow.beginFill(color, 0.8)
  arrow.moveTo(0, -10)
  arrow.lineTo(-4, -4)
  arrow.lineTo(4, -4)
  arrow.closePath()
  arrow.endFill()
  c.addChild(arrow)

  const trail = new PIXI.Graphics()
  c.addChildAt(trail, 0)

  container!.addChild(c)

  droneGraphics.set(droneId, { container: c, ring, dot, arrow, trail })
}

function updateDronePositions(time: number) {
  if (!props.map || !container) return

  const zoom = props.map.getZoom()
  const scale = Math.pow(2, zoom - 14)

  let idx = 0
  store.drones.forEach((drone) => {
    let gfx = droneGraphics.get(drone.droneId)
    if (!gfx) {
      createDroneGraphic(drone.droneId, idx)
      gfx = droneGraphics.get(drone.droneId)!
    }

    const pos = latLngToPixel(drone.lat, drone.lng)
    gfx.container.position.set(pos.x, pos.y)

    gfx.arrow.rotation = (drone.heading * Math.PI) / 180

    const baseSize = 6
    const pulse = Math.sin(time * 0.003 + idx) * 0.3 + 1
    gfx.dot.clear()
    gfx.dot.beginFill(getDroneColor(idx), 0.9)
    gfx.dot.drawCircle(0, 0, baseSize * Math.min(scale, 2))
    gfx.dot.endFill()

    gfx.ring.clear()
    gfx.ring.lineStyle(1.5, getDroneColor(idx), 0.3 + Math.sin(time * 0.002 + idx) * 0.2)
    gfx.ring.drawCircle(0, 0, baseSize * Math.min(scale, 2) * pulse + 6)

    const buf = trajectoryBuffers.get(drone.droneId)
    if (buf && buf.length > 1) {
      gfx.trail.clear()
      const points = buf.slice(-200)
      for (let i = 1; i < points.length; i++) {
        const p1 = latLngToPixel(points[i - 1].lat, points[i - 1].lng)
        const p2 = latLngToPixel(points[i].lat, points[i].lng)
        const alpha = (i / points.length) * 0.5
        const lineWidth = Math.max(1, 3 * Math.min(scale, 1.5))
        gfx.trail.lineStyle(lineWidth, getDroneColor(idx), alpha)
        gfx.trail.moveTo(p1.x, p1.y)
        gfx.trail.lineTo(p2.x, p2.y)
      }
    }

    idx++
  })
}

function onTelemetryUpdate(data: DroneTelemetry) {
  let buf = trajectoryBuffers.get(data.droneId)
  if (!buf) {
    buf = []
    trajectoryBuffers.set(data.droneId, buf)
  }
  buf.push({ lat: data.lat, lng: data.lng, timestamp: data.timestamp })
  if (buf.length > TRAJECTORY_MAX) {
    buf.splice(0, buf.length - TRAJECTORY_MAX)
  }
}

function syncTransform() {
  if (!props.map || !app || !container) return

  app.renderer.resize(props.map.getSize().x, props.map.getSize().y)
  container.position.set(0, 0)
  container.scale.set(1)
}

function animate(time: number) {
  if (!app || !container) return

  if (time - lastTime > 16) {
    syncTransform()
    updateDronePositions(time)
    lastTime = time
  }

  animFrameId = requestAnimationFrame(animate)
}

function setup() {
  if (!props.map || !pixiContainer.value) return

  app = new PIXI.Application({
    width: props.map.getSize().x,
    height: props.map.getSize().y,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })

  const canvas = app.view as HTMLCanvasElement
  canvas.style.position = 'absolute'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.pointerEvents = 'none'
  pixiContainer.value.appendChild(canvas)

  container = new PIXI.Container()
  app.stage.addChild(container)

  props.map.on('move', syncTransform)
  props.map.on('zoom', syncTransform)
  props.map.on('resize', syncTransform)

  syncTransform()

  animFrameId = requestAnimationFrame(animate)
}

function cleanup() {
  if (animFrameId) cancelAnimationFrame(animFrameId)

  droneGraphics.forEach((gfx) => {
    gfx.container.destroy({ children: true })
  })
  droneGraphics.clear()
  trajectoryBuffers.clear()

  if (app) {
    app.destroy(true, { children: true })
    app = null
  }
  container = null
}

let unwatchTelemetry: (() => void) | null = null

onMounted(() => {
  nextTick(() => {
    setup()
    unwatchTelemetry = watch(
      () => {
        const list: DroneTelemetry[] = []
        store.drones.forEach((d) => list.push(d))
        return list
      },
      (newList) => {
        newList.forEach((d) => onTelemetryUpdate(d))
      },
      { deep: true }
    )
  })
})

onUnmounted(() => {
  unwatchTelemetry?.()
  cleanup()
})

watch(() => props.map, (newMap) => {
  if (newMap) {
    cleanup()
    nextTick(setup)
  }
})
</script>
