import { ref, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

export function useSocket(url: string = 'http://localhost:3000') {
  const socket = ref<Socket | null>(null)
  const connected = ref(false)
  const reconnectCount = ref(0)

  const connect = () => {
    const s = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })

    s.on('connect', () => {
      connected.value = true
      reconnectCount.value = 0
    })

    s.on('disconnect', () => {
      connected.value = false
    })

    s.on('reconnect_attempt', () => {
      reconnectCount.value++
    })

    socket.value = s
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  connect()

  return {
    socket,
    connected,
    reconnectCount,
    disconnect,
    reconnect: connect,
  }
}
