import { useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

interface RealtimeNotificationProps {
  onNewData?: (data: any) => void
}

export const RealtimeNotification = ({ onNewData }: RealtimeNotificationProps) => {
  const { isConnected, newDailyData, currentSimulatedDate } = useWebSocket()

  useEffect(() => {
    if (isConnected) {
      toast.push(
        <Notification type="success" title="Sistema en tiempo real">
          Conectado - Recibiendo datos automáticamente
        </Notification>,
        { placement: 'top-end' }
      )
    }
  }, [isConnected])

  useEffect(() => {
    if (newDailyData && currentSimulatedDate) {
      toast.push(
        <Notification type="info" title="Nuevos datos disponibles">
          {currentSimulatedDate} - {newDailyData.dailyConsumptions.length} consumos actualizados
        </Notification>,
        { placement: 'top-end' }
      )

      if (onNewData) {
        onNewData(newDailyData)
      }
    }
  }, [newDailyData, currentSimulatedDate, onNewData])

  return (
    <>
      {isConnected && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
          <span>Sistema en tiempo real activo</span>
        </div>
      )}
    </>
  )
}
