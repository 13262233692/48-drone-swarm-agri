import { createRouter, createWebHistory } from 'vue-router'
import CommandScreen from '@/pages/CommandScreen.vue'

const routes = [
  {
    path: '/',
    name: 'command',
    component: CommandScreen,
  },
  {
    path: '/fleet',
    name: 'fleet',
    component: () => import('@/pages/FleetList.vue'),
  },
  {
    path: '/drone/:id',
    name: 'drone-detail',
    component: () => import('@/pages/DroneDetail.vue'),
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
