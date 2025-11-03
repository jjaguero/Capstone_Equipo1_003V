import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3000'

interface NewDailyData {
  date: string
  dailyConsumptions: any[]
  measurements: any[]
  simulatedDate: string
}

interface NewMeasurement {
  sensorId: string
  homeId: string
  liters: number
  flowRate: number
  durationSec: number
  startTime: string
  endTime: string
  action: 'open' | 'close'
}

interface UseWebSocketReturn {
  socket: Socket | null
  isConnected: boolean
  newDailyData: NewDailyData | null
  newMeasurement: NewMeasurement | null
  currentSimulatedDate: string | null
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [newDailyData, setNewDailyData] = useState<NewDailyData | null>(null)
  const [newMeasurement, setNewMeasurement] = useState<NewMeasurement | null>(null)
  const [currentSimulatedDate, setCurrentSimulatedDate] = useState<string | null>(null)

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance.on('connect', () => {
      console.log('WebSocket connected:', socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    })

    socketInstance.on('newDailyData', (data: NewDailyData) => {
      console.log('Nuevos datos recibidos:', data.simulatedDate)
      setNewDailyData(data)
      setCurrentSimulatedDate(data.simulatedDate)
    })

    socketInstance.on('newMeasurement', (data: NewMeasurement) => {
      console.log('Nuevo measurement:', data.action === 'close' ? 'Llave cerrada' : 'Llave abierta', data)
      setNewMeasurement(data)
    })

    socketInstance.on('newAlert', (data: any) => {
      console.log('Nueva alerta:', data)
    })

    socketInstance.on('connect_error', (error) => {
      console.warn('WebSocket connection error (ignored)')
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return {
    socket,
    isConnected,
    newDailyData,
    newMeasurement,
    currentSimulatedDate,
  }
}
