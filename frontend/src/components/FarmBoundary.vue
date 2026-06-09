<template>
  <div ref="container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import { useFleetStore } from '@/stores/fleet'
import type { LeafMap } from '@/shared/types'

const props = defineProps<{
  map: any
}>()

const container = ref<HTMLElement>()
const store = useFleetStore()
let geoJsonLayer: L.GeoJSON | null = null

onMounted(() => {
  if (props.map) addBoundary()
})

onUnmounted(() => {
  if (geoJsonLayer && props.map) {
    props.map.removeLayer(geoJsonLayer)
  }
})

watch(() => props.map, (newMap) => {
  if (newMap) addBoundary()
})

watch(() => store.farms.length, () => {
  if (props.map) addBoundary()
})

function addBoundary() {
  if (!props.map) return

  if (geoJsonLayer) {
    props.map.removeLayer(geoJsonLayer)
    geoJsonLayer = null
  }

  if (store.farms.length === 0) return

  store.farms.forEach((farm) => {
    geoJsonLayer = L.geoJSON(farm.geojson, {
      style: {
        color: '#00e5a0',
        weight: 2,
        opacity: 0.8,
        fillColor: '#00e5a0',
        fillOpacity: 0.08,
        dashArray: '6 4',
      },
    }).addTo(props.map!)

    geoJsonLayer!.bindTooltip(farm.name, {
      permanent: false,
      direction: 'center',
      className: 'farm-tooltip',
    })
  })
}
</script>
