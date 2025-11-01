import { Card } from '@/components/ui'
import { PiDropDuotone } from 'react-icons/pi'

interface ChartDataPoint {
  date: string
  consumption: number
}

interface ConsumptionChartProps {
  chartData: ChartDataPoint[]
  userDailyLimit: number
  metrics: { avgDaily: string; totalConsumption: string; changePercent: string }
  onMouseEnter: (
    e: React.MouseEvent<SVGCircleElement>,
    date: string,
    liters: number
  ) => void
  onMouseLeave: () => void
}

export const ConsumptionChart = ({
  chartData,
  userDailyLimit,
  metrics,
  onMouseEnter,
  onMouseLeave,
}: ConsumptionChartProps) => {
  const maxConsumption = Math.max(...chartData.map((d) => d.consumption))
  const avgValue = parseFloat(metrics.avgDaily)

  return (
    <Card className="transform p-6 transition-all duration-500 hover:shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Comportamiento de Consumo por Hogar
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Análisis de tendencias y patrones de uso
          </p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Consumo Diario
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-cyan-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Promedio
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Meta Diaria ({userDailyLimit}L)
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8">
        <div className="animation-delay-200 animate-fade-in-up">
          <div className="mb-2 flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Consumo Total
            </span>
            <div
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                parseFloat(metrics.changePercent) >= 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}
            >
              {parseFloat(metrics.changePercent) >= 0 ? '+' : ''}
              {metrics.changePercent}%
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.totalConsumption}L
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              este período
            </span>
          </div>
        </div>

        <div className="animation-delay-300 animate-fade-in-up">
          <div className="mb-2 flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Promedio Diario
            </span>
            <PiDropDuotone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.avgDaily}L
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              por día
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-80 overflow-hidden">
        <svg
          className="h-full w-full animate-fade-in"
          viewBox="0 0 800 300"
          onMouseLeave={onMouseLeave}
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 30"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            </pattern>
            <linearGradient
              id="blueGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {chartData.length > 1 && (
            <>
              <path
                fill="url(#blueGradient)"
                d={`M 25,250 ${chartData
                  .map(
                    (item, index) =>
                      `L ${(index / (chartData.length - 1)) * 750 + 25},${250 - (item.consumption / maxConsumption) * 200}`
                  )
                  .join(' ')} L ${((chartData.length - 1) / (chartData.length - 1)) * 750 + 25},250 Z`}
                className="animation-delay-500 animate-fade-in"
              />

              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartData
                  .map(
                    (item, index) =>
                      `${(index / (chartData.length - 1)) * 750 + 25},${250 - (item.consumption / maxConsumption) * 200}`
                  )
                  .join(' ')}
                className="animation-delay-600 animate-fade-in"
              />

              {chartData.map((item, index) => (
                <circle
                  key={item.date}
                  cx={(index / (chartData.length - 1)) * 750 + 25}
                  cy={250 - (item.consumption / maxConsumption) * 200}
                  r="6"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:r-8"
                  onMouseEnter={(e) => onMouseEnter(e, item.date, item.consumption)}
                  style={{
                    animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
                  }}
                />
              ))}

              {!isNaN(avgValue) && avgValue > 0 && (
                <line
                  x1="25"
                  y1={250 - (avgValue / maxConsumption) * 200}
                  x2="775"
                  y2={250 - (avgValue / maxConsumption) * 200}
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animation-delay-700 animate-fade-in"
                />
              )}

              {userDailyLimit > 0 && (
                <line
                  x1="25"
                  y1={250 - (userDailyLimit / maxConsumption) * 200}
                  x2="775"
                  y2={250 - (userDailyLimit / maxConsumption) * 200}
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  className="animation-delay-800 animate-fade-in"
                />
              )}
            </>
          )}

          {[0, 25, 50, 75, 100].map((percent) => {
            const value = ((100 - percent) / 100) * maxConsumption
            return (
              <text
                key={percent}
                x="10"
                y={50 + (percent / 100) * 200}
                fontSize="12"
                fill="#6b7280"
                textAnchor="start"
              >
                {Math.round(value)}L
              </text>
            )
          })}

          {chartData.map((item, index) => {
            if (index % Math.ceil(chartData.length / 8) === 0) {
              return (
                <text
                  key={item.date}
                  x={(index / (chartData.length - 1)) * 750 + 25}
                  y="280"
                  fontSize="11"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {new Date(item.date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </text>
              )
            }
            return null
          })}
        </svg>
      </div>
    </Card>
  )
}
