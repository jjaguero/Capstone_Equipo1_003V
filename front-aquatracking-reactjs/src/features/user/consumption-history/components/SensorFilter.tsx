import React from 'react'
import { PiDropDuotone } from 'react-icons/pi'
import type { Sensor } from '@/@types/entities'
import { normalizeSensorName } from '@/utils/sensor-name.utils'

interface SensorFilterProps {
  sensors: Sensor[]
  selectedSensorId: string | null
  onSensorSelect: (sensorId: string | null) => void
}

const SensorFilter: React.FC<SensorFilterProps> = ({
  sensors,
  selectedSensorId,
  onSensorSelect
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-3 mb-4">
        <PiDropDuotone className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Filtrar por Sensor</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <button
          onClick={() => onSensorSelect(null)}
          className={`p-3 rounded-lg border-2 transition-all ${
            selectedSensorId === null
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <div className="font-medium">Todos los sensores</div>
          <div className="text-sm opacity-75">
            {sensors.length} sensores
          </div>
        </button>
        
        {sensors.map((sensor) => (
          <button
            key={sensor._id}
            onClick={() => onSensorSelect(sensor._id)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedSensorId === sensor._id
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <div className="font-medium truncate">{normalizeSensorName(sensor.subType || sensor.category || 'Sensor')}</div>
            <div className="text-sm opacity-75 truncate">{normalizeSensorName(sensor.location || 'Sin ubicación')}</div>
            <div className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
              sensor.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {sensor.status === 'active' ? 'Activo' : 'Inactivo'}
            </div>
          </button>
        ))}
      </div>
      
      {selectedSensorId && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-blue-700 font-medium">
                Filtrando por: {sensors.find(s => s._id === selectedSensorId)?.subType || sensors.find(s => s._id === selectedSensorId)?.category}
              </span>
            </div>
            <button
              onClick={() => onSensorSelect(null)}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Limpiar filtro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SensorFilter