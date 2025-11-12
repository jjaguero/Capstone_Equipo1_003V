import { useState, useEffect } from 'react'
import { Card } from '@/components/ui'
import Container from '@/components/shared/Container'
import Breadcrumb from '@/components/shared/Breadcrumb'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import { useSensors } from '@/features/user/sensors/hooks/useSensors'
import { useWebSocket } from '@/hooks/useWebSocket'
import { 
  PiDropDuotone, 
  PiDevicesDuotone,
  PiChartLineDuotone
} from 'react-icons/pi'
import { RealtimeFlowChart, ActiveSensorsList, RecentMeasurements } from '../components'
import ApiService from '@/services/ApiService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
// removed normalizeSensorName: panel removed

interface Measurement {
  _id: string
  sensorId: string
  homeId: string
  startTime: string
  endTime: string
  liters: number
  durationSec: number
}

const RealtimePage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { sensors, loading: sensorsLoading } = useSensors(currentUser?.homeId)
  const { isConnected, newMeasurement } = useWebSocket()
  
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [measurementsLoading, setMeasurementsLoading] = useState(true)
  const [currentFlow, setCurrentFlow] = useState(0)
  const [activeSensorsCount, setActiveSensorsCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null)

  // Fetch initial measurements (today's data)
  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!currentUser?.homeId) return
      
      try {
        setMeasurementsLoading(true)
        
  // Obtener inicio del día actual (solo fecha) y fin = ahora (para que el fetch vaya hasta la hora actual)
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
  const endOfDay = new Date() // ahora
        
        console.log('Fetching measurements for today:', {
          startOfDay: startOfDay.toISOString(),
          endOfDay: endOfDay.toISOString(),
          homeId: currentUser.homeId
        })
        
        // Fetch measurements from today only
        const response = await ApiService.fetchDataWithAxios<Measurement[]>({
          url: `/measurements?homeId=${currentUser.homeId}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}&sort=-startTime`
        })
        
        console.log(`Received ${response.length} measurements for today`)
        
        setMeasurements(response)
        setLastUpdate(new Date())
        
        // Calcular el flowRate de la medición más reciente
        if (response.length > 0) {
          const latestMeasurement = response[0]
          const flowRate = latestMeasurement.durationSec > 0 
            ? (latestMeasurement.liters / latestMeasurement.durationSec) * 60 
            : 0
          setCurrentFlow(flowRate)
        } else {
          setCurrentFlow(0)
        }
      } catch (error) {
        console.error('Error fetching measurements:', error)
      } finally {
        setMeasurementsLoading(false)
      }
    }

    fetchMeasurements()
    
    // Refetch every 30 seconds for realtime updates
    const interval = setInterval(fetchMeasurements, 30 * 1000)
    
    return () => clearInterval(interval)
  }, [currentUser?.homeId])

  // Update flow from WebSocket (SOLO del usuario actual)
  useEffect(() => {
    // Filtrar: solo procesar mediciones del homeId del usuario actual
    if (!newMeasurement || newMeasurement.homeId !== currentUser?.homeId) {
      return
    }

    // Ignorar mediciones con timestamp en el futuro (posible ruido/histórico mal enviado)
    if (newMeasurement.startTime) {
      const measurementTime = new Date(newMeasurement.startTime)
      if (measurementTime.getTime() > Date.now()) {
        // Ignorar
        return
      }
    }

    if (newMeasurement.action === 'open') {
      const flowRate = newMeasurement.durationSec > 0 
        ? (newMeasurement.liters / newMeasurement.durationSec) * 60 
        : newMeasurement.flowRate
      setCurrentFlow(flowRate)
      
      // Add new measurement to the list (prepend to beginning)
      setMeasurements(prev => [newMeasurement as any, ...prev])
      setLastUpdate(new Date())
    } else if (newMeasurement.action === 'close') {
      setCurrentFlow(0)
      setLastUpdate(new Date())
    }
  }, [newMeasurement, currentUser?.homeId])

  // Update active sensors count
  useEffect(() => {
    const activeSensors = sensors.filter(s => s.status === 'active')
    setActiveSensorsCount(activeSensors.length)
  }, [sensors])

  // panel for per-device consumption removed as requested

  if (!currentUser?.homeId) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sin acceso
            </h3>
            <p className="text-gray-600">
              No tienes un hogar asignado para ver datos en tiempo real.
            </p>
          </Card>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Breadcrumb />
      
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-700">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Monitoreo en Vivo</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700">
            <PiChartLineDuotone className="text-lg" />
            <span className="text-sm font-medium">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Última actualización</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {format(lastUpdate, 'HH:mm:ss', { locale: es })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-blue-600 text-sm font-medium uppercase tracking-wide">Velocidad del Agua</span>
                <div className="text-3xl font-bold text-blue-700 mt-1">
                  {currentFlow.toFixed(1)}
                  <span className="text-lg text-blue-500 ml-1">L/min</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Litros por minuto</p>
              </div>
              <PiDropDuotone className="text-5xl text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-0 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-emerald-600 text-sm font-medium uppercase tracking-wide">Sensores Activos</span>
                <div className="text-3xl font-bold text-emerald-700 mt-1">
                  {activeSensorsCount}
                  <span className="text-lg text-emerald-500 ml-1">de {sensors.length}</span>
                </div>
              </div>
              <PiDevicesDuotone className="text-5xl text-emerald-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-purple-600 text-sm font-medium uppercase tracking-wide">Usos de Hoy</span>
                <div className="text-3xl font-bold text-purple-700 mt-1">
                  {measurements.length}
                  <span className="text-lg text-purple-500 ml-1">registros</span>
                </div>
                <p className="text-xs text-purple-600 mt-1">Total de usos del día actual</p>
              </div>
              <PiChartLineDuotone className="text-5xl text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RealtimeFlowChart 
            measurements={measurements} 
            sensors={sensors} 
            loading={measurementsLoading}
            selectedSensorId={selectedSensorId}
            onSensorSelect={setSelectedSensorId}
          />
        </div>
        
        <div className="space-y-6">
          <ActiveSensorsList 
            sensors={sensors} 
            loading={sensorsLoading}
            selectedSensorId={selectedSensorId}
            onSensorSelect={setSelectedSensorId}
          />

          {/* per-device consumption panel removed */}
        </div>
      </div>

      <div className="mt-6">
        <RecentMeasurements measurements={measurements.slice(0, 10)} />
      </div>
    </Container>
  )
}

export default RealtimePage
