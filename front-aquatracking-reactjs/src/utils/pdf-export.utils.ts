import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ConsumptionData {
  date: string
  liters: number
  sensor?: string
}

interface SensorConsumption {
  sensorName: string
  location: string
  totalLiters: number
  percentage: number
}

interface ExportPDFOptions {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: Date
  endDate: Date
  userName: string
  homeAddress: string
  consumptionData: ConsumptionData[]
  sensorConsumption: SensorConsumption[]
  totalConsumption: number
  averageDaily: number
}

export const generateConsumptionPDF = (options: ExportPDFOptions) => {
  try {
    const {
      period,
      startDate,
      endDate,
      userName,
      homeAddress,
      consumptionData,
      sensorConsumption,
      totalConsumption,
      averageDaily,
    } = options

    console.log('Generating PDF with options:', options)

    const doc = new jsPDF()
    
    // Colores del tema
    const primaryColor: [number, number, number] = [99, 102, 241] // Indigo
    const secondaryColor: [number, number, number] = [147, 197, 253] // Light blue
    const textColor: [number, number, number] = [31, 41, 55] // Gray-800
    const lightGray: [number, number, number] = [243, 244, 246] // Gray-100

  // Header con logo y título
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('AquaTracking', 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Reporte de Consumo de Agua', 105, 30, { align: 'center' })

  // Información del período
  let yPos = 50
  doc.setTextColor(...textColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const periodText = {
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    yearly: 'Anual'
  }[period] || 'Mensual'

  doc.text(`Período: ${periodText}`, 20, yPos)
  doc.text(`Desde: ${format(startDate, 'dd/MM/yyyy', { locale: es })}`, 20, yPos + 6)
  doc.text(`Hasta: ${format(endDate, 'dd/MM/yyyy', { locale: es })}`, 20, yPos + 12)
  
  doc.text(`Usuario: ${userName}`, 120, yPos)
  doc.text(`Dirección: ${homeAddress}`, 120, yPos + 6)
  doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 120, yPos + 12)

  // Resumen de consumo
  yPos += 30
  doc.setFillColor(...secondaryColor)
  doc.roundedRect(15, yPos - 5, 180, 30, 3, 3, 'F')
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Resumen de Consumo', 105, yPos + 2, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)
  doc.text(`Consumo Total:`, 25, yPos + 12)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`${totalConsumption.toFixed(2)} L`, 70, yPos + 12)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Promedio Diario:`, 120, yPos + 12)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`${averageDaily.toFixed(2)} L`, 165, yPos + 12)

  // Tabla de consumo por sensor
  yPos += 40
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Consumo por Dispositivo', 20, yPos)

  const sensorTableData = sensorConsumption.map((sensor, index) => [
    `${index + 1}`,
    sensor.sensorName,
    sensor.location,
    `${sensor.totalLiters.toFixed(2)} L`,
    `${sensor.percentage.toFixed(1)}%`
  ])

  autoTable(doc, {
    startY: yPos + 5,
    head: [['#', 'Dispositivo', 'Ubicación', 'Consumo', '%']],
    body: sensorTableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'center', cellWidth: 25 }
    },
    margin: { left: 20, right: 20 }
  })

  // Si hay espacio, agregar gráfico de consumo diario (como tabla)
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 80
  
  if (finalY < 220 && consumptionData.length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('Detalle de Consumo', 20, finalY + 15)

    // Limitar a los últimos 10 registros para que quepa
    const recentData = consumptionData.slice(-10)
    const consumptionTableData = recentData.map(item => [
      format(new Date(item.date), 'dd/MM/yyyy', { locale: es }),
      item.sensor || 'General',
      `${item.liters.toFixed(2)} L`
    ])

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Fecha', 'Sensor', 'Consumo']],
      body: consumptionTableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: textColor,
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: lightGray
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 80 },
        2: { halign: 'right', cellWidth: 40 }
      },
      margin: { left: 20, right: 20 }
    })
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      287,
      { align: 'center' }
    )
    doc.text(
      'AquaTracking - Sistema de Monitoreo de Consumo de Agua',
      105,
      292,
      { align: 'center' }
    )
  }

  // Generar nombre del archivo
  const periodLabel = periodText.toLowerCase()
  const dateLabel = format(startDate, 'yyyy-MM-dd')
  const fileName = `consumo-${periodLabel}-${dateLabel}.pdf`

  // Descargar el PDF
  doc.save(fileName)
  console.log('PDF saved successfully:', fileName)
  } catch (error) {
    console.error('Error generating PDF document:', error)
    throw error
  }
}

// Función auxiliar para preparar datos desde la API
export const prepareConsumptionDataForPDF = (
  measurements: any[],
  sensors: any[],
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
): ConsumptionData[] => {
  try {
    if (!measurements || measurements.length === 0) {
      return []
    }

    const groupedData: { [key: string]: number } = {}

    measurements.forEach(measurement => {
      // La estructura real tiene: { date, totalLiters, bySensor: [...] }
      const date = measurement.date || measurement.startTime
      const liters = measurement.totalLiters || measurement.liters || 0
      
      if (!date) {
        console.warn('Invalid measurement (no date):', measurement)
        return
      }

      const dateObj = new Date(date)
      let key: string

      switch (period) {
        case 'daily':
          key = format(dateObj, 'yyyy-MM-dd')
          break
        case 'weekly':
          key = format(dateObj, 'yyyy-ww')
          break
        case 'monthly':
          key = format(dateObj, 'yyyy-MM')
          break
        case 'yearly':
          key = format(dateObj, 'yyyy')
          break
        default:
          key = format(dateObj, 'yyyy-MM-dd')
      }

      groupedData[key] = (groupedData[key] || 0) + liters
    })

    return Object.entries(groupedData).map(([date, liters]) => ({
      date,
      liters
    }))
  } catch (error) {
    console.error('Error preparing consumption data:', error)
    return []
  }
}

export const calculateSensorConsumption = (
  measurements: any[],
  sensors: any[]
): SensorConsumption[] => {
  try {
    if (!measurements || measurements.length === 0) {
      return []
    }

    const sensorMap: { [key: string]: { liters: number; sensor: any } } = {}

    measurements.forEach(measurement => {
      // La estructura real tiene bySensor: [{ sensorId, liters }, ...]
      if (measurement.bySensor && Array.isArray(measurement.bySensor)) {
        measurement.bySensor.forEach((sensorData: any) => {
          const sensorId = sensorData.sensorId
          const liters = sensorData.liters || 0

          if (!sensorId) return

          if (!sensorMap[sensorId]) {
            const sensor = sensors.find(s => s._id === sensorId)
            sensorMap[sensorId] = {
              liters: 0,
              sensor
            }
          }
          sensorMap[sensorId].liters += liters
        })
      }
    })

    const totalConsumption = Object.values(sensorMap).reduce((sum, item) => sum + item.liters, 0)

    return Object.values(sensorMap)
      .map(item => ({
        sensorName: item.sensor?.subType || item.sensor?.category || 'Sensor Desconocido',
        location: item.sensor?.location || 'Sin ubicación',
        totalLiters: item.liters,
        percentage: totalConsumption > 0 ? (item.liters / totalConsumption) * 100 : 0
      }))
      .sort((a, b) => b.totalLiters - a.totalLiters)
  } catch (error) {
    console.error('Error calculating sensor consumption:', error)
    return []
  }
}
