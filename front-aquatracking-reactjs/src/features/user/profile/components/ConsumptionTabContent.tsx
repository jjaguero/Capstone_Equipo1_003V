import { Card, Input, Button, Notification, toast } from '@/components/ui'
import { FormItem } from '@/components/ui/Form'
import {
  PiDropDuotone,
  PiGearDuotone,
  PiCalculatorDuotone,
  PiSparkle,
  PiLightbulbDuotone,
} from 'react-icons/pi'
import { usePredictions } from '@/hooks/usePredictions'
import Spinner from '@/components/ui/Spinner'

interface ConsumptionTabContentProps {
  currentUser: any
  sensors: any[]
  consumptionConfig: any
  setConsumptionConfig: (config: any) => void
  getRealAverageConsumption: () => number
  getCalculatedLimit: () => number
  updateProfile: (id: string, data: any) => Promise<any>
  loading: boolean
}

export const ConsumptionTabContent = ({
  currentUser,
  sensors,
  consumptionConfig,
  setConsumptionConfig,
  getRealAverageConsumption,
  getCalculatedLimit,
  updateProfile,
  loading,
}: ConsumptionTabContentProps) => {
  // Obtener predicciones ML
  const { predictions, loading: predictionsLoading } = usePredictions(currentUser?.homeId, 7);
  
  // Calcular promedio predicho
  const avgPredicted = predictions.length > 0
    ? predictions.reduce((sum, p) => sum + p.predictedLiters, 0) / predictions.length
    : 0;

  const handleSaveConfig = async () => {
    try {
      const newLimit = consumptionConfig.useAutoCalculation
        ? getCalculatedLimit()
        : consumptionConfig.customLimit

      await updateProfile(currentUser!._id, {
        limitLitersPerDay: newLimit,
        people: consumptionConfig.people,
      })

      const updatedUser = {
        ...currentUser,
        limitLitersPerDay: newLimit,
        people: consumptionConfig.people,
      }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))

      toast.push(
        <Notification type="success" title="Éxito">
          Configuración de consumo actualizada
        </Notification>
      )

      setTimeout(() => window.location.reload(), 1000)
    } catch (error: any) {
      toast.push(
        <Notification type="danger" title="Error">
          Error al actualizar configuración
        </Notification>
      )
    }
  }

  return (
    <Card className="bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col gap-8 p-8">
        <div>
          <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Configuración de Consumo
          </h5>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Ajusta los parámetros para calcular tu límite diario de consumo de agua
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-6 dark:from-blue-900/20 dark:to-cyan-900/20 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
              <PiDropDuotone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Límite Actual</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentUser?.limitLitersPerDay || 0}L
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
              <PiGearDuotone className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sensores Activos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {sensors.length}
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800">
              <PiCalculatorDuotone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Promedio Real</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {getRealAverageConsumption()}L
            </p>
          </div>
        </div>

        {/* Sugerencias basadas en Predicciones ML */}
        {!predictionsLoading && predictions.length > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <PiLightbulbDuotone className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div className="flex-1">
                <h6 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  Sugerencias Basadas en Predicción
                  <span className="text-xs font-normal text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">ML</span>
                </h6>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Nuestro modelo de Machine Learning analiza tu historial de consumo y predice tus necesidades futuras
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Promedio Predicho</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {Math.round(avgPredicted)}
                      <span className="text-sm font-normal text-gray-500 ml-1">L/día</span>
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Límite Sugerido</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {Math.round(avgPredicted * 1.15)}
                      <span className="text-sm font-normal text-gray-500 ml-1">L/día</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">+15% margen de seguridad</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Precisión del Modelo</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {predictions[0].confidence === 'high' ? 'Alta' : 'Media'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Basado en 7 días</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button
                    size="sm"
                    variant="solid"
                    onClick={() => {
                      setConsumptionConfig((prev: any) => ({
                        ...prev,
                        useAutoCalculation: false,
                        customLimit: Math.round(avgPredicted * 1.15),
                      }));
                      toast.push(
                        <Notification type="success" title="Sugerencia aplicada">
                          Límite ajustado según predicción ML
                        </Notification>
                      );
                    }}
                    className="bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    Aplicar Límite Sugerido
                  </Button>
                  <Button
                    size="sm"
                    variant="plain"
                    onClick={() => {
                      setConsumptionConfig((prev: any) => ({
                        ...prev,
                        useAutoCalculation: false,
                        customLimit: Math.round(avgPredicted),
                      }));
                    }}
                  >
                    Usar Solo Predicción
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {predictionsLoading && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-3">
              <Spinner size={20} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Analizando predicciones...
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormItem label="Número de personas en el hogar" asterisk>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                min="1"
                max="20"
                value={consumptionConfig.people}
                onChange={(e) =>
                  setConsumptionConfig((prev: any) => ({
                    ...prev,
                    people: parseInt(e.target.value) || 1,
                  }))
                }
                className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-500">personas</span>
            </div>
          </FormItem>

          <FormItem label="Consumo promedio por persona" asterisk>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                min="50"
                max="500"
                value={consumptionConfig.avgConsumptionPerPerson}
                onChange={(e) =>
                  setConsumptionConfig((prev: any) => ({
                    ...prev,
                    avgConsumptionPerPerson: parseInt(e.target.value) || 150,
                  }))
                }
                className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-500">L/día</span>
            </div>
          </FormItem>
        </div>

        <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h6 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Cálculo Automático
            </h6>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={consumptionConfig.useAutoCalculation}
                onChange={(e) =>
                  setConsumptionConfig((prev: any) => ({
                    ...prev,
                    useAutoCalculation: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Usar cálculo automático
              </span>
            </label>
          </div>

          {consumptionConfig.useAutoCalculation ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Personas:</span>
                  <span className="font-medium">{consumptionConfig.people}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Consumo por persona:
                  </span>
                  <span className="font-medium">
                    {consumptionConfig.avgConsumptionPerPerson}L
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sensores activos:</span>
                  <span className="font-medium">{sensors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Factor de ajuste:</span>
                  <span className="font-medium">
                    +{((sensors.length * 0.05) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Límite Calculado:
                  </span>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {getCalculatedLimit()}L/día
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <FormItem label="Límite personalizado (litros por día)" asterisk>
              <div className="flex items-center space-x-3">
                <Input
                  type="number"
                  min="50"
                  max="2000"
                  value={consumptionConfig.customLimit}
                  onChange={(e) =>
                    setConsumptionConfig((prev: any) => ({
                      ...prev,
                      customLimit: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-500">L/día</span>
              </div>
            </FormItem>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="solid"
            onClick={handleSaveConfig}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white transition-all duration-200 hover:bg-indigo-700"
          >
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
