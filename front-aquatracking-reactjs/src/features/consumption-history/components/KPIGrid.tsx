import React from 'react'

interface KPICard {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  trend: 'up' | 'down' | 'stable'
  change: string
}

interface KPIGridProps {
  kpiCards: KPICard[]
}

const KPIGrid: React.FC<KPIGridProps> = ({ kpiCards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpiCards.map((kpi, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <kpi.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{kpi.title}</h3>
                <p className="text-sm text-gray-600">{kpi.subtitle}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              kpi.trend === 'up' ? 'bg-red-100 text-red-700' :
              kpi.trend === 'down' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {kpi.trend === 'up' ? '↗' : kpi.trend === 'down' ? '↘' : '→'} {kpi.change}
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {kpi.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KPIGrid