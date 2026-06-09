<template>
  <div ref="containerRef" class="voronoi-cells-layer" />
</template>

<script setup lang="ts">
import { watch, onUnmounted, ref } from 'vue'
import L from 'leaflet'
import { useFleetStore } from '@/stores/fleet'

const props = defineProps<{ map: L.Map | null }>()
const store = useFleetStore()
const containerRef = ref<HTMLDivElement>()

let layers: L.Layer[] = []

function renderCells() {
  clearLayers()
  if (!props.map || store.voronoiAssignments.length === 0) return

  const colors = Array.from({ length: 50 }, (_, i) => {
    const hue = (i * 360 / 50) % 360
    return `hsla(${hue}, 80%, 55%, 0.18)`
  })

  const borderColors = Array.from({ length: 50 }, (_, i) => {
    const hue = (i * 360 / 50) % 360
    return `hsla(${hue}, 90%, 65%, 0.7)`
  })

  for (let ai = 0; ai < store.voronoiAssignments.length; ai++) {
    const assignment = store.voronoiAssignments[ai]
    const points = assignment.cell?.polygon?.points
    if (!points || points.length < 3) continue

    const colorIdx = parseInt(assignment.droneId.replace('DRONE-', '')) - 1
    const latlngs: L.LatLngExpression[] = points.map((p: any) => [p.y, p.x] as [number, number])

    const polygon = L.polygon(latlngs, {
      color: borderColors[colorIdx % 50],
      weight: 2,
      dashArray: '6 4',
      fillColor: colors[colorIdx % 50],
      fillOpacity: 0.25,
      interactive: false,
    })

    polygon.addTo(props.map)
    layers.push(polygon)

    if (assignment.waypoints && assignment.waypoints.length >= 2) {
      const waypointLatLngs: L.LatLngExpression[] = assignment.waypoints.map((wp: any) => [wp.y, wp.x] as [number, number])
      const polyline = L.polyline(waypointLatLngs, {
        color: borderColors[colorIdx % 50],
        weight: 1,
        opacity: 0.5,
        dashArray: '3 6',
        interactive: false,
      })
      polyline.addTo(props.map)
      layers.push(polyline)
    }
  }
}

function clearLayers() {
  for (const layer of layers) {
    ;(props.map as any)?.removeLayer(layer)
  }
  layers = []
}

watch(() => store.voronoiAssignments.length, () => {
  renderCells()
}, { immediate: true })

watch(() => props.map, () => {
  renderCells()
})

onUnmounted(() => {
  clearLayers()
})
</script>

<style scoped>
.voronoi-cells-layer {
  display: none;
}
</style>
