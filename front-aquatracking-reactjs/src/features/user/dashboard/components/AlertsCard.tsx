import React from 'react'
import { Card, Button } from '@/components/ui'
import { Alert } from '@/@types/entities'
import { PiBellDuotone, PiWarningDuotone, PiInfoDuotone, PiCheckCircleDuotone, PiArrowRightDuotone } from 'react-icons/pi'

interface AlertsCardProps {
  alerts: Alert[]
  loading: boolean
  onAlertClick?: (alert: Alert) => void
  onMarkAsRead?: (alertId: string) => void
}

const AlertsCard: React.FC<AlertsCardProps> = ({ alerts, loading, onAlertClick, onMarkAsRead }) => {
  const handleNavigateToAlerts = () => {
    window.location.href = '/user/alerts'
  }
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recientes</h5>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Cargando alertas...</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="p-6">
          <h5 className="text-lg font-semibold text-gray-900 mb-4">Alertas Recientes</h5>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 rounded-full flex items-center justify-center">
                <PiCheckCircleDuotone className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-emerald-600 font-medium">Todo funcionando bien</p>
              <p className="text-sm text-gray-500 mt-1">No hay alertas activas</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const unresolvedAlerts = alerts.filter(a => !a.resolved)
  const recentAlerts = alerts.slice(0, 5)

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high':
        return <PiWarningDuotone className="w-5 h-5 text-red-500" />
      case 'warning':
        return <PiWarningDuotone className="w-5 h-5 text-amber-500" />
      case 'info':
        return <PiInfoDuotone className="w-5 h-5 text-blue-500" />
      default:
        return <PiBellDuotone className="w-5 h-5 text-gray-500" />
    }
  }

  const getAlertTypeText = (type: string) => {
    switch (type) {
      case 'high':
        return 'Crítica'
      case 'warning':
        return 'Advertencia'
      case 'info':
        return 'Información'
      default:
        return 'Alerta'
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'warning':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'info':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (date: string | Date) => {
    const alertDate = new Date(date)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora'
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    } else {
      return alertDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h5 className="text-lg font-semibold text-gray-900">Alertas Recientes</h5>
          <div className="flex items-center gap-2">
            <PiBellDuotone className="w-5 h-5 text-indigo-500" />
            {unresolvedAlerts.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                {unresolvedAlerts.length} pendiente{unresolvedAlerts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Lista de alertas */}
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div 
              key={alert._id} 
              className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
                !alert.resolved ? 'border-l-4 border-l-red-400 bg-red-50/30' : 'border-gray-200'
              }`}
              onClick={() => onAlertClick?.(alert)}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertTypeColor(alert.type)}`}>
                      {getAlertTypeText(alert.type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(alert.triggeredAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-800 mb-2">{alert.message}</p>
                  
                  {!alert.resolved && onMarkAsRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onMarkAsRead(alert._id)
                      }}
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                      Marcar como leída
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button 
            variant="plain" 
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            onClick={handleNavigateToAlerts}
          >
            <span className="flex items-center justify-center space-x-2">
              <span>
                {alerts.length > 5 ? `Ver todas las alertas (${alerts.length})` : 'Ver gestión completa de alertas'}
              </span>
              <PiArrowRightDuotone className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default AlertsCard