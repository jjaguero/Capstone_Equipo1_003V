import React from 'react'
import { Card } from '@/components/ui'
import Chart from 'react-apexcharts'

interface DistributionData {
  range: string
  count: number
  percentage: number
}

interface DistributionChartProps {
  data: DistributionData[]
  loading?: boolean
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  data,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (!data?.length) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución por Rangos de Consumo
        </h3>
        <div className="text-center py-8 text-gray-500">
          No hay datos de distribución disponibles
        </div>
      </Card>
    )
  }

  const chartOptions = {
    chart: {
      type: 'bar' as const,
      height: 350,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ['#6366F1', '#10B981', '#F59E0B', '#EF4444'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 8,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val + ' hogares'
      },
      style: {
        fontSize: '12px',
        fontWeight: 500,
        colors: ['#374151']
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: data.map(item => item.range),
      title: {
        text: 'Rangos de Consumo',
        style: {
          fontSize: '14px',
          fontWeight: 500,
          color: '#6B7280',
        },
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#6B7280',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: 'Cantidad de Hogares',
        style: {
          fontSize: '14px',
          fontWeight: 500,
          color: '#6B7280',
        },
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#6B7280',
        },
      },
    },
    fill: {
      opacity: 0.9
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: function (val: number, opts: any) {
          const percentage = data[opts.dataPointIndex]?.percentage || 0
          return val + ' hogares (' + percentage.toFixed(1) + '%)'
        }
      }
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    legend: {
      show: false,
    },
  }

  const chartSeries = [{
    name: 'Hogares',
    data: data.map(item => item.count)
  }]

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Distribución por Rangos de Consumo
      </h3>
      <div className="h-80">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height="100%"
        />
      </div>
      
      {/* Resumen textual */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {data.map((item, index) => {
          const colors = ['text-indigo-600', 'text-emerald-600', 'text-amber-600', 'text-red-600']
          const bgColors = ['bg-indigo-50', 'bg-emerald-50', 'bg-amber-50', 'bg-red-50']
          return (
            <div key={index} className={`text-center p-3 rounded-lg ${bgColors[index % bgColors.length]} transition-colors duration-200`}>
              <div className={`font-semibold text-lg ${colors[index % colors.length]}`}>
                {item.count}
              </div>
              <div className="text-gray-600 text-xs font-medium mt-1">{item.range}</div>
              <div className="text-gray-500 text-xs">({item.percentage.toFixed(1)}%)</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}