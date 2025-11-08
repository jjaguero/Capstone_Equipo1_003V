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
      let endDate: Date = endOfDay(now)
      let periodLabel: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'

      switch (selectedPeriod) {
        case 'daily':
          startDate = startOfDay(now)
          endDate = endOfDay(now)
          periodLabel = 'daily'
          break
        case 'weekly':
          startDate = startOfDay(subDays(now, 7))
          endDate = endOfDay(now)
          periodLabel = 'weekly'
          break
        case 'monthly':
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
          periodLabel = 'monthly'
          break
        case 'yearly':
          startDate = startOfYear(now)
          endDate = endOfYear(now)
          periodLabel = 'yearly'
          break
        case 'specific-month':
          const month = parseInt(selectedMonth)
          const year = parseInt(selectedYear)
          startDate = startOfMonth(new Date(year, month, 1))
          endDate = endOfMonth(new Date(year, month, 1))
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
          endDate = endOfDay(customEndDate)
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
          endDate = endOfMonth(now)
          periodLabel = 'monthly'
      }

      console.log('=== DEBUG PDF EXPORT ===')
      console.log('Period Type:', selectedPeriod)
      console.log('Period Label:', periodLabel)
      console.log('Start Date:', startDate)
      console.log('End Date:', endDate)

      // Filtrar measurements por el rango de fechas seleccionado
      const filteredMeasurements = measurements.filter((m) => {
        const measurementDate = new Date(m.date)
        return measurementDate >= startDate && measurementDate <= endDate
      })

      console.log('Total Measurements:', measurements.length)
      console.log('Filtered Measurements:', filteredMeasurements.length)
      console.log('Filtered Data:', filteredMeasurements)

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
      
      // Calcular consumo total desde los measurements filtrados
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

