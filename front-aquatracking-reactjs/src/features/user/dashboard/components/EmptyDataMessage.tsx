import React from 'react'
import { Card } from '@/components/ui'
import { PiHouseDuotone, PiUserDuotone, PiInfoDuotone } from 'react-icons/pi'

interface EmptyDataMessageProps {
  homeId: string
  userName: string
}

const EmptyDataMessage: React.FC<EmptyDataMessageProps> = ({ homeId, userName }) => {
  return (
    <div className="col-span-full">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <PiHouseDuotone className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Configuración de Hogar en Proceso
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Tu cuenta está asociada a un hogar, pero aún no hay sensores instalados ni datos de consumo registrados.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6 text-left max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <PiInfoDuotone className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Información de tu Cuenta</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <PiUserDuotone className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">
                  <strong>Usuario:</strong> {userName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <PiHouseDuotone className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">
                  <strong>ID de Hogar:</strong> {homeId.slice(-8)}...
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>📡 <strong>Próximos pasos:</strong></p>
            <ul className="space-y-1">
              <li>• El administrador instalará los sensores de agua</li>
              <li>• Se configurarán los límites de consumo</li>
              <li>• Comenzarás a ver datos en tiempo real</li>
            </ul>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Una vez que se complete la instalación, verás aquí toda la información de consumo de agua, estado de sensores y alertas.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default EmptyDataMessage