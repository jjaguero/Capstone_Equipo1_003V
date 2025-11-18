import { Card } from '@/components/ui'
import { PiBellDuotone } from 'react-icons/pi'

export const NotificationsTabContent = () => {
  return (
    <Card className="bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col gap-8 p-8">
        <div>
          <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Preferencias de Notificaciones
          </h5>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Configura cómo y cuándo quieres recibir notificaciones
          </p>
        </div>

        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <PiBellDuotone className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p className="font-medium text-gray-600 dark:text-gray-400">
              Configuración de notificaciones
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Esta funcionalidad estará disponible próximamente
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
