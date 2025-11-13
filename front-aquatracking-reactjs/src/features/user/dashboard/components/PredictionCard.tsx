import { Card } from '@/components/ui';
import { PiDropBold, PiTrendUpBold, PiCalendarDotsBold } from 'react-icons/pi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePredictions } from '@/hooks/usePredictions';
import Spinner from '@/components/ui/Spinner';

interface PredictionCardProps {
  homeId: string;
  days?: number;
}

const PredictionCard = ({ homeId, days = 7 }: PredictionCardProps) => {
  const { predictions, loading, error } = usePredictions(homeId, days);

  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-64">
          <Spinner size={40} />
        </div>
      </Card>
    );
  }

  if (error || predictions.length === 0) {
    return (
      <Card className="h-full">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <PiDropBold className="text-4xl mb-2 opacity-50" />
          <p className="text-sm">No hay predicciones disponibles</p>
        </div>
      </Card>
    );
  }

  const tomorrow = predictions[0];
  const totalPredicted = predictions.reduce((sum, p) => sum + p.predictedLiters, 0);
  const avgDaily = totalPredicted / predictions.length;
  const maxDay = predictions.reduce((max, p) => (p.predictedLiters > max.predictedLiters ? p : max));

  return (
    <Card className="h-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Predicción de Consumo
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Próximos {days} días
            </p>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <PiTrendUpBold className="text-2xl text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        {/* Tomorrow Prediction - Simple */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Mañana</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {format(new Date(tomorrow.date), "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>
            <PiDropBold className="text-2xl text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {tomorrow.predictedLiters.toFixed(0)}
            </span>
            <span className="text-lg font-medium text-gray-500">litros</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-gray-500 text-sm">
            <PiCalendarDotsBold />
            <span>
              {tomorrow.features.members} {tomorrow.features.members === 1 ? 'habitante' : 'habitantes'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Promedio Diario</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {avgDaily.toFixed(0)}
              <span className="text-sm font-normal text-gray-500 ml-1">L</span>
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Día Mayor Consumo</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {maxDay.predictedLiters.toFixed(0)}
              <span className="text-sm font-normal text-gray-500 ml-1">L</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {format(new Date(maxDay.date), 'EEEE', { locale: es })}
            </p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Predicción Semanal
          </h4>
          {predictions.map((pred, index) => {
            const percentage = (pred.predictedLiters / maxDay.predictedLiters) * 100;
            const date = new Date(pred.date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {format(date, 'EEE d', { locale: es })}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-semibold">
                    {pred.predictedLiters.toFixed(0)} L
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 dark:bg-gray-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Prediction */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Predicho ({days} días)
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {totalPredicted.toFixed(0)} L
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PredictionCard;
