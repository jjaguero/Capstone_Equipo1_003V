import { useState } from 'react'
import { Button, Select, DatePicker } from '@/components/ui'
import { PiFilePdfDuotone, PiDownloadDuotone } from 'react-icons/pi'
import { generateConsumptionPDF, calculateSensorConsumption, prepareConsumptionDataForPDF } from '@/utils/pdf-export.utils'
import { Sensor } from '@/@types/entities'
import { toast } from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns'

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | 'specific-month'

interface ExportPDFButtonProps {
  measurements: any[]
  sensors: Sensor[]
  userName: string
  homeAddress: string
  buttonText?: string
  variant?: 'solid' | 'plain' | 'default'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  showPeriodSelector?: boolean
}

const ExportPDFButton = ({
  measurements,
  sensors,
  userName,
  homeAddress,
  buttonText = 'Exportar PDF',
  variant = 'solid',
  size = 'sm',
  className = '',
  showPeriodSelector = true
}: ExportPDFButtonProps) => {
  const [isExporting, setIsExporting] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly')
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  const periodOptions = [
    { value: 'daily', label: 'Hoy' },
    { value: 'weekly', label: 'Última Semana' },
    { value: 'monthly', label: 'Este Mes' },
    { value: 'yearly', label: 'Este Año' },
    { value: 'specific-month', label: 'Mes Específico' },
    { value: 'custom', label: 'Período Personalizado' }
  ]

  const monthOptions = [
    { value: '0', label: 'Enero' },
    { value: '1', label: 'Febrero' },
    { value: '2', label: 'Marzo' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Mayo' },
    { value: '5', label: 'Junio' },
    { value: '6', label: 'Julio' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Septiembre' },
    { value: '9', label: 'Octubre' },
    { value: '10', label: 'Noviembre' },
    { value: '11', label: 'Diciembre' }
  ]

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i
    return { value: year.toString(), label: year.toString() }
  })

  const handleExport = async () => {
    try {
      setIsExporting(true)

      const now = new Date()
      let startDate: Date
      let endDate: Date // Se asignará según el período
      let periodLabel: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'

      switch (selectedPeriod) {
        case 'daily':
          startDate = startOfDay(now)
          endDate = endOfDay(now) // Día completo (DailyConsumption representa todo el día)
          periodLabel = 'daily'
          break
        case 'weekly':
          startDate = startOfDay(subDays(now, 6)) // Últimos 7 días incluyendo hoy
          endDate = endOfDay(now) // Hasta fin del día actual
          periodLabel = 'weekly'
          break
        case 'monthly':
          startDate = startOfMonth(now)
          endDate = endOfMonth(now) // Mes completo
          periodLabel = 'monthly'
          break
        case 'yearly':
          startDate = startOfYear(now)
          endDate = endOfYear(now) // Año completo
          periodLabel = 'yearly'
          break
        case 'specific-month':
          const month = parseInt(selectedMonth)
          const year = parseInt(selectedYear)
          const specifiedDate = new Date(year, month, 1)
          startDate = startOfMonth(specifiedDate)
          endDate = endOfMonth(specifiedDate) // Mes completo
          periodLabel = 'monthly'
          break
        case 'custom':
          if (!customStartDate || !customEndDate) {
            toast.push(
              <Notification type="warning" title="Fechas requeridas">
                Por favor selecciona las fechas de inicio y fin
              </Notification>,
              { placement: 'top-end' }
            )
            setIsExporting(false)
            return
          }
          startDate = startOfDay(customStartDate)
          endDate = endOfDay(customEndDate) // Día completo
          // Determinar el tipo de período basado en el rango
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysDiff <= 1) {
            periodLabel = 'daily'
          } else if (daysDiff <= 7) {
            periodLabel = 'weekly'
          } else if (daysDiff <= 31) {
            periodLabel = 'monthly'
          } else {
            periodLabel = 'yearly'
          }
          break
        default:
          startDate = startOfMonth(now)
          const isDefaultCurrentMonth = now.getMonth() === new Date().getMonth() && now.getFullYear() === new Date().getFullYear()
          endDate = isDefaultCurrentMonth ? now : endOfMonth(now)
          periodLabel = 'monthly'
      }

      console.log('=== DEBUG PDF EXPORT ===')
      console.log('Period Type:', selectedPeriod)
      console.log('Period Label:', periodLabel)
      console.log('Start Date:', startDate)
      console.log('End Date:', endDate)
      console.log('Sample measurement:', measurements[0])
      console.log('All measurement dates:', measurements.map(m => m.date))

      // Filtrar measurements por el rango de fechas seleccionado
      // Los datos son DailyConsumption con campo "date" en formato ISO "YYYY-MM-DD"
      // Normalizamos las fechas a medianoche para comparar solo días
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      
      console.log('Start Date Only:', startDateOnly.toISOString())
      console.log('End Date Only:', endDateOnly.toISOString())
      
      const filteredMeasurements = measurements.filter((m) => {
        // El campo date viene como "2025-11-13T00:00:00.000Z"
        const measurementDate = new Date(m.date)
        const measurementDateOnly = new Date(measurementDate.getFullYear(), measurementDate.getMonth(), measurementDate.getDate())
        
        const isInRange = measurementDateOnly >= startDateOnly && measurementDateOnly <= endDateOnly
        
        if (measurements.indexOf(m) < 5) {
          console.log(`Checking measurement ${measurements.indexOf(m)}:`, {
            date: m.date,
            measurementDateOnly: measurementDateOnly.toISOString(),
            startDateOnly: startDateOnly.toISOString(),
            endDateOnly: endDateOnly.toISOString(),
            isAfterStart: measurementDateOnly >= startDateOnly,
            isBeforeEnd: measurementDateOnly <= endDateOnly,
            isInRange
          })
        }
        return isInRange
      })

      console.log('Total Measurements:', measurements.length)
      console.log('Filtered Measurements:', filteredMeasurements.length)
      console.log('First filtered:', filteredMeasurements[0])
      console.log('Last filtered:', filteredMeasurements[filteredMeasurements.length - 1])

      if (filteredMeasurements.length === 0) {
        toast.push(
          <Notification type="warning" title="Sin datos">
            No hay datos de consumo en el período seleccionado
          </Notification>,
          { placement: 'top-end' }
        )
        setIsExporting(false)
        return
      }

      console.log('Sensors:', sensors)

      // Calcular estadísticas
      const consumptionData = prepareConsumptionDataForPDF(filteredMeasurements, sensors, periodLabel)
      console.log('Consumption Data:', consumptionData)
      
      const sensorConsumption = calculateSensorConsumption(filteredMeasurements, sensors)
      console.log('Sensor Consumption:', sensorConsumption)
      
      // Calcular consumo total desde los DailyConsumption filtrados
      const totalConsumption = filteredMeasurements.reduce((sum, m) => sum + (m.totalLiters || 0), 0)
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const averageDaily = days > 0 ? totalConsumption / days : totalConsumption

      console.log('Total Consumption:', totalConsumption)
      console.log('Average Daily:', averageDaily)

      // Generar PDF
      generateConsumptionPDF({
        period: periodLabel,
        startDate,
        endDate,
        userName,
        homeAddress,
        consumptionData,
        sensorConsumption,
        totalConsumption,
        averageDaily
      })

      console.log('PDF Generated Successfully')

      toast.push(
        <Notification type="success" title="PDF Generado">
          El reporte ha sido descargado exitosamente
        </Notification>,
        { placement: 'top-end' }
      )
    } catch (error) {
      console.error('Error generating PDF:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      toast.push(
        <Notification type="danger" title="Error">
          No se pudo generar el reporte PDF. Por favor, verifica los datos e intenta nuevamente.
        </Notification>,
        { placement: 'top-end' }
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {showPeriodSelector && (
        <div className="flex flex-wrap items-center gap-3">
          <Select
            size="sm"
            value={periodOptions.find(opt => opt.value === selectedPeriod)}
            options={periodOptions}
            onChange={(option: any) => setSelectedPeriod(option.value)}
            className="w-48"
            placeholder="Seleccionar período"
          />
          
          {selectedPeriod === 'specific-month' && (
            <>
              <Select
                size="sm"
                value={monthOptions.find(opt => opt.value === selectedMonth)}
                options={monthOptions}
                onChange={(option: any) => setSelectedMonth(option.value)}
                className="w-36"
                placeholder="Mes"
              />
              <Select
                size="sm"
                value={yearOptions.find(opt => opt.value === selectedYear)}
                options={yearOptions}
                onChange={(option: any) => setSelectedYear(option.value)}
                className="w-28"
                placeholder="Año"
              />
            </>
          )}
          
          {selectedPeriod === 'custom' && (
            <>
              <DatePicker
                size="sm"
                value={customStartDate}
                onChange={(date) => setCustomStartDate(date as Date)}
                placeholder="Fecha inicio"
                className="w-40"
                inputFormat="DD/MM/YYYY"
              />
              <DatePicker
                size="sm"
                value={customEndDate}
                onChange={(date) => setCustomEndDate(date as Date)}
                placeholder="Fecha fin"
                className="w-40"
                inputFormat="DD/MM/YYYY"
              />
            </>
          )}
        </div>
      )}
      
      <Button
        variant={variant}
        size={size}
        icon={isExporting ? <PiDownloadDuotone className="animate-bounce" /> : <PiFilePdfDuotone />}
        onClick={handleExport}
        loading={isExporting}
        disabled={isExporting || measurements.length === 0}
        className={`transition-all duration-300 hover:shadow-lg ${
          measurements.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isExporting ? 'Generando...' : buttonText}
      </Button>
    </div>
  )
}

export default ExportPDFButton

