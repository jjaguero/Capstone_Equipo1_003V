import { Card } from '@/components/ui'
import Container from '@/components/shared/Container'
import { useConsumption } from '@/hooks/useConsumption'
import { useSensors } from '@/features/sensors/hooks/useSensors'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import { normalizeSensorName, getFullSensorName } from '@/utils/sensor-name.utils'
import { useState } from 'react'
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  PiDropDuotone, 
  PiCalendarDuotone, 
  PiChartBarDuotone,
  PiChartLineUpDuotone,
  PiTrendUpDuotone,
  PiTrendDownDuotone,
  PiClockDuotone,
  PiTargetDuotone,
  PiCaretDownDuotone,
  PiExportDuotone
} from 'react-icons/pi'
import Button from '@/components/ui/Button'

const ConsumptionHistoryPage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { consumptions, loading: consumptionLoading } = useConsumption(currentUser?.homeId)
  const { sensors, loading: sensorsLoading } = useSensors(currentUser?.homeId)

  // Estados para filtros de fecha y sensores
  const [timePeriod, setTimePeriod] = useState<'Weekly' | 'Monthly' | 'Annually'>('Monthly')
  const [selectedMetric, setSelectedMetric] = useState<'consumption' | 'efficiency' | 'savings'>('consumption')
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null)
  
  // Estados para tooltips interactivos
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean
    x: number
    y: number
    date: string
    consumption: number
    index: number
  } | null>(null)

  // Función para obtener rango de fechas según período
  const getDateRange = () => {
    const today = new Date()
    switch (timePeriod) {
      case 'Weekly':
        return {
          start: startOfWeek(today),
          end: endOfWeek(today)
        }
      case 'Monthly':
        return {
          start: startOfMonth(today),
          end: endOfMonth(today)
        }
      case 'Annually':
        return {
          start: new Date(today.getFullYear(), 0, 1),
          end: new Date(today.getFullYear(), 11, 31)
        }
    }
  }

  // Datos filtrados por fecha
  const filteredConsumptions = consumptions.filter(c => {
    const date = c.date
    return date >= dateFrom && date <= dateTo
  })

  // Datos filtrados por sensor específico para análisis detallado
  const sensorFilteredData = selectedSensorId 
    ? filteredConsumptions.map(consumption => ({
        ...consumption,
        totalLiters: consumption.bySensor.find(bs => bs.sensorId === selectedSensorId)?.liters || 0
      }))
    : filteredConsumptions

  // Límite diario del usuario (usar limitLitersPerDay o 150L como fallback)
  const userDailyLimit = currentUser?.limitLitersPerDay || 150

  // Cálculos de métricas analíticas
  const getAnalyticMetrics = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    
    const todayData = consumptions.find(c => c.date === today)
    const yesterdayData = consumptions.find(c => c.date === yesterday)
    
    const totalConsumption = filteredConsumptions.reduce((sum, c) => sum + c.totalLiters, 0)
    const avgDaily = totalConsumption / Math.max(filteredConsumptions.length, 1)
    
    const todayConsumption = todayData?.totalLiters || 0
    const yesterdayConsumption = yesterdayData?.totalLiters || 0
    const changePercent = yesterdayConsumption > 0 
      ? ((todayConsumption - yesterdayConsumption) / yesterdayConsumption) * 100 
      : 0

    const avgTimeOnSystem = "Normal"
    const efficiencyRate = Math.max(0, 100 - (changePercent || 0))

    return {
      totalConsumption: totalConsumption.toFixed(0),
      avgDaily: avgDaily.toFixed(1),
      changePercent: changePercent.toFixed(1),
      avgTimeOnSystem,
      efficiencyRate: efficiencyRate.toFixed(1),
      activeSensors: sensors.length
    }
  }

  // Datos para el gráfico de consumo
  const getChartData = () => {
    const dataToShow = selectedSensorId ? sensorFilteredData : filteredConsumptions
    return dataToShow.slice(-15).map(consumption => ({
      date: format(new Date(consumption.date), 'dd MMM', { locale: es }),
      fullDate: format(new Date(consumption.date), 'PPP', { locale: es }),
      consumption: consumption.totalLiters
    }))
  }

  // Funciones para manejo de tooltips
  const handleMouseEnter = (event: React.MouseEvent, dataPoint: any, index: number) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const containerRect = (event.currentTarget.closest('svg') as SVGElement)?.getBoundingClientRect()
    
    if (!containerRect) return
    
    // Calcular posición relativa al contenedor SVG
    const relativeX = event.clientX - containerRect.left
    const relativeY = event.clientY - containerRect.top
    
    setTooltipData({
      visible: true,
      x: relativeX,
      y: relativeY,
      date: dataPoint.fullDate,
      consumption: dataPoint.consumption,
      index
    })
  }

  const handleMouseLeave = () => {
    setTooltipData(null)
  }

  const metrics = getAnalyticMetrics()
  const chartData = getChartData()

  if (!currentUser?.homeId) {
    return (
      <Container>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso no autorizado</h2>
            <p className="text-gray-600">No tienes permisos para ver esta sección.</p>
          </div>
        </div>
      </Container>
    )
  }

  if (consumptionLoading || sensorsLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <PiClockDuotone className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600">Cargando análisis...</p>
            </div>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Header del Dashboard */}
        <div className="flex items-center justify-between animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Consumo</h1>
            <p className="text-gray-600 mt-1">Monitorea y analiza el consumo de agua de tu hogar</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">
              {format(new Date(), 'PPP', { locale: es })}
            </span>
          </div>
        </div>

        {/* Filtros de fecha y sensores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up animation-delay-100">
          {/* Filtros de fecha */}
          <Card className="p-6 transform transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <PiCalendarDuotone className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Filtrar por Período</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Selector de sensores */}
          <Card className="p-6 transform transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <PiDropDuotone className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">Filtrar por Sensor</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sensor específico</label>
                <select
                  value={selectedSensorId || ''}
                  onChange={(e) => setSelectedSensorId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todos los sensores</option>
                  {sensors.map(sensor => (
                    <option key={sensor._id} value={sensor._id}>
                      {getFullSensorName(sensor.location || '', sensor.subType || sensor.category || '')}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </Card>
        </div>

        {/* Dashboard principal de consumo */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in-up animation-delay-200">
          {/* Gráfico principal de consumo */}
          <div className="lg:col-span-3">
            <Card className="p-6 transform transition-all duration-500 hover:shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Comportamiento de Consumo por Hogar</h3>
                  <p className="text-sm text-gray-600 mt-1">Análisis de tendencias y patrones de uso</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Consumo Diario</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Promedio</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Meta Diaria ({userDailyLimit}L)</span>
                  </div>
                </div>
              </div>

              {/* Métricas principales */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="animate-fade-in-up animation-delay-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600">Consumo Total</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      parseFloat(metrics.changePercent) >= 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {parseFloat(metrics.changePercent) >= 0 ? '+' : ''}{metrics.changePercent}%
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">{metrics.totalConsumption}L</span>
                    <span className="text-sm text-gray-500">este período</span>
                  </div>
                </div>

                <div className="animate-fade-in-up animation-delay-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600">Promedio Diario</span>
                    <PiDropDuotone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">{metrics.avgDaily}L</span>
                    <span className="text-sm text-blue-600 font-medium">por día</span>
                  </div>
                </div>
              </div>

              {/* Gráfico de consumo interactivo */}
              <div className="h-80 overflow-hidden relative">
                <svg 
                  className="w-full h-full animate-fade-in" 
                  viewBox="0 0 800 300"
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Grid de fondo */}
                  <defs>
                    <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                    </pattern>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Área bajo la curva */}
                  {chartData.length > 1 && (
                    <path
                      fill="url(#blueGradient)"
                      d={`M ${25},250 ${chartData.map((item, index) => 
                        `L ${(index / (chartData.length - 1)) * 750 + 25},${250 - (item.consumption / Math.max(...chartData.map(d => d.consumption)) * 200)}`
                      ).join(' ')} L ${(chartData.length - 1) / (chartData.length - 1) * 750 + 25},250 Z`}
                      className="animate-fade-in animation-delay-500"
                    />
                  )}
                  
                  {/* Líneas del gráfico de consumo */}
                  {chartData.length > 1 && (
                    <>
                      {/* Línea de consumo diario (azul) */}
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="1000"
                        strokeDashoffset="1000"
                        className="animate-draw-line"
                        points={chartData.map((item, index) => 
                          `${(index / (chartData.length - 1)) * 750 + 25},${250 - (item.consumption / Math.max(...chartData.map(d => d.consumption)) * 200)}`
                        ).join(' ')}
                      />
                      
                      {/* Línea de promedio (cyan) */}
                      <polyline
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        strokeDashoffset="500"
                        className="animate-draw-line animation-delay-500"
                        points={chartData.map((item, index) => 
                          `${(index / (chartData.length - 1)) * 750 + 25},${250 - (metrics.avgDaily && parseFloat(metrics.avgDaily) > 0 ? (parseFloat(metrics.avgDaily) / Math.max(...chartData.map(d => d.consumption)) * 200) : 100)}`
                        ).join(' ')}
                      />
                      
                      {/* Línea de meta diaria (verde) - basada en límite del usuario */}
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeDasharray="10,5"
                        strokeDashoffset="300"
                        className="animate-draw-line animation-delay-1000"
                        points={chartData.map((item, index) => 
                          `${(index / (chartData.length - 1)) * 750 + 25},${250 - (userDailyLimit / Math.max(...chartData.map(d => d.consumption)) * 200)}`
                        ).join(' ')}
                      />
                    </>
                  )}

                  {/* Puntos interactivos */}
                  {chartData.map((item, index) => {
                    const x = (index / (chartData.length - 1)) * 750 + 25
                    const y = 250 - (item.consumption / Math.max(...chartData.map(d => d.consumption)) * 200)
                    
                    return (
                      <g key={index}>
                        {/* Área de detección invisible más grande */}
                        <circle
                          cx={x}
                          cy={y}
                          r="15"
                          fill="transparent"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => handleMouseEnter(e, item, index)}
                        />
                        {/* Punto visible */}
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#3b82f6"
                          stroke="#ffffff"
                          strokeWidth="2"
                          className={`animate-fade-in transition-all duration-200 ${
                            tooltipData?.index === index ? 'r-6 fill-blue-700' : 'hover:r-5'
                          }`}
                          style={{ 
                            animationDelay: `${index * 100 + 1000}ms`,
                            filter: tooltipData?.index === index ? 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))' : 'none'
                          }}
                        />
                      </g>
                    )
                  })}
                  
                  {/* Etiquetas del eje X */}
                  {chartData.map((item, index) => (
                    <text
                      key={index}
                      x={(index / (chartData.length - 1)) * 750 + 25}
                      y="280"
                      textAnchor="middle"
                      className="fill-gray-500 text-xs animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {item.date}
                    </text>
                  ))}
                </svg>

                {/* Tooltip personalizado */}
                {tooltipData && (
                  <div
                    className="absolute pointer-events-none z-50 animate-fade-in"
                    style={{
                      left: Math.min(Math.max(tooltipData.x - 100, 10), 600), // Centrado y con límites
                      top: Math.max(tooltipData.y - 120, 10), // Siempre arriba del punto con margen
                      transform: 'translateX(-50%)', // Centrado horizontal
                    }}
                  >
                    <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-52">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-semibold text-gray-900 text-sm">Consumo Diario</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="pb-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Fecha</p>
                          <p className="text-sm font-medium text-gray-900">{tooltipData.date}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Consumo</p>
                            <p className="text-lg font-bold text-blue-600">
                              {tooltipData.consumption.toFixed(1)}L
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Promedio</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {metrics.avgDaily}L/día
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">vs Meta ({userDailyLimit}L)</span>
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                tooltipData.consumption <= userDailyLimit ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className={`text-xs font-medium ${
                                tooltipData.consumption <= userDailyLimit ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {tooltipData.consumption <= userDailyLimit ? 'Dentro del límite' : 'Límite excedido'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  tooltipData.consumption <= userDailyLimit ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{ 
                                  width: `${Math.min((tooltipData.consumption / userDailyLimit) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>0L</span>
                              <span>{userDailyLimit}L</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Flecha del tooltip - siempre centrada */}
                    <div 
                      className="absolute w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45"
                      style={{
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        top: '100%',
                        marginTop: '-6px'
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Panel de KPIs del consumo */}
          <div className="space-y-6">
            {/* Consumo de hoy */}
            <Card className="p-6 animate-fade-in-up animation-delay-300 transform transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Consumo Hoy</span>
                <PiDropDuotone className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mb-1">
                <span className="text-2xl font-bold text-gray-900">{consumptions.find(c => c.date === format(new Date(), 'yyyy-MM-dd'))?.totalLiters.toFixed(1) || '0.0'}L</span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`font-medium ${parseFloat(metrics.changePercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(metrics.changePercent) >= 0 ? '+' : ''}{metrics.changePercent}%
                </span>
                <span className="text-gray-500 ml-1">vs ayer</span>
              </div>
            </Card>

            {/* Eficiencia */}
            <Card className="p-6 animate-fade-in-up animation-delay-400 transform transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Eficiencia</span>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <PiTargetDuotone className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mb-1">
                <span className="text-2xl font-bold text-gray-900">{metrics.efficiencyRate}%</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">Óptimo</span>
                <span className="text-gray-500 ml-1">este mes</span>
              </div>
            </Card>

            {/* Sensores activos */}
            <Card className="p-6 animate-fade-in-up animation-delay-500 transform transition-all duration-300 hover:shadow-lg hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Sensores Activos</span>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <PiChartLineUpDuotone className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mb-1">
                <span className="text-2xl font-bold text-gray-900">{metrics.activeSensors}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-blue-600 font-medium">Monitoreando</span>
                <span className="text-gray-500 ml-1">tu hogar</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabla de datos detallados por fecha */}
        <Card className="p-6 animate-fade-in-up animation-delay-300 transform transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Datos Detallados por Día</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedSensorId 
                  ? `Mostrando datos del sensor específico (${sensorFilteredData.length} registros)`
                  : `Mostrando datos de todos los sensores (${filteredConsumptions.length} registros)`
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {format(new Date(dateFrom), 'dd/MM/yyyy')} - {format(new Date(dateTo), 'dd/MM/yyyy')}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Consumo (L)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sensores Activos</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Promedio por Sensor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {(selectedSensorId ? sensorFilteredData : filteredConsumptions)
                  .slice(0, 10)
                  .map((consumption, index) => {
                    const prevConsumption = index > 0 
                      ? (selectedSensorId ? sensorFilteredData : filteredConsumptions)[index - 1]
                      : null
                    
                    const trend = prevConsumption 
                      ? consumption.totalLiters > prevConsumption.totalLiters ? 'up' : 'down'
                      : 'stable'
                    
                    const activeSensorsCount = selectedSensorId 
                      ? 1
                      : consumption.bySensor.filter(bs => bs.liters > 0).length
                    
                    const avgPerSensor = activeSensorsCount > 0 
                      ? (consumption.totalLiters / activeSensorsCount).toFixed(1)
                      : '0.0'

                    return (
                      <tr key={consumption.date} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {format(new Date(consumption.date), 'dd/MM/yyyy')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(consumption.date), 'EEEE', { locale: es })}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-lg font-semibold text-blue-600">
                            {consumption.totalLiters.toFixed(1)}L
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900 font-medium">
                            {activeSensorsCount}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">
                            {avgPerSensor}L
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {trend === 'up' ? (
                              <PiTrendUpDuotone className="w-5 h-5 text-green-600" />
                            ) : trend === 'down' ? (
                              <PiTrendDownDuotone className="w-5 h-5 text-red-600" />
                            ) : (
                              <div className="w-5 h-5 flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              </div>
                            )}
                            <span className={`text-sm font-medium ${
                              trend === 'up' ? 'text-green-600' : 
                              trend === 'down' ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {trend === 'up' ? 'Subida' : trend === 'down' ? 'Bajada' : 'Estable'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>

          {(selectedSensorId ? sensorFilteredData : filteredConsumptions).length > 10 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Mostrando los primeros 10 registros de {(selectedSensorId ? sensorFilteredData : filteredConsumptions).length} total
              </p>
            </div>
          )}
        </Card>
      </div>
    </Container>
  )
}

export default ConsumptionHistoryPage