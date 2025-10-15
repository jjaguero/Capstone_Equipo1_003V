import React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PiListDuotone, PiWavesDuotone } from 'react-icons/pi'
import type { DailyConsumption } from '@/@types/entities'

interface ConsumptionTableProps {
  consumptions: DailyConsumption[]
}

const ConsumptionTable: React.FC<ConsumptionTableProps> = ({ consumptions }) => {
  if (consumptions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <PiListDuotone className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Datos Detallados</h3>
          </div>
        </div>
        <div className="p-8 text-center">
          <PiWavesDuotone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium mb-2">No hay datos disponibles</p>
          <p className="text-gray-400 text-sm">
            Intenta ajustar los filtros de fecha o sensor
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PiListDuotone className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Datos Detallados</h3>
          </div>
          <div className="text-sm text-gray-600">
            {consumptions.length} registros
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consumo (L)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                vs Límite
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {consumptions.slice(0, 15).map((consumption, index) => {
              const limitLiters = consumption.limitLiters || 1000 // Default si no hay límite
              const limitPercentage = (consumption.totalLiters / limitLiters) * 100
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(consumption.date), 'dd MMM yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {consumption.totalLiters.toFixed(1)} L
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            limitPercentage > 100 ? 'bg-red-500' :
                            limitPercentage > 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(limitPercentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {limitPercentage.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      limitPercentage > 100 ? 'bg-red-100 text-red-800' :
                      limitPercentage > 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {limitPercentage > 100 ? 'Excedido' :
                       limitPercentage > 80 ? 'Alerta' : 'Normal'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ConsumptionTable