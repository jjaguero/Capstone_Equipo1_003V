import { Card, Input, Button } from '@/components/ui'
import { FormItem } from '@/components/ui/Form'
import { PiLockKeyDuotone } from 'react-icons/pi'

interface SecurityTabContentProps {
  passwordData: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
  loading: boolean
  handlePasswordChange: (field: string, value: string) => void
  handlePasswordUpdate: () => void
}

export const SecurityTabContent = ({
  passwordData,
  loading,
  handlePasswordChange,
  handlePasswordUpdate,
}: SecurityTabContentProps) => {
  return (
    <Card className="bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col gap-8 p-8">
        <div>
          <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Seguridad de la Cuenta
          </h5>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Actualiza tu contraseña para mantener tu cuenta segura
          </p>
        </div>

        <div className="grid max-w-md grid-cols-1 gap-6">
          <FormItem label="Contraseña actual" asterisk>
            <Input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              placeholder="Tu contraseña actual"
              className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
            />
          </FormItem>

          <FormItem label="Nueva contraseña" asterisk>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
            />
          </FormItem>

          <FormItem label="Confirmar contraseña" asterisk>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
            />
          </FormItem>

          <Button
            variant="solid"
            onClick={handlePasswordUpdate}
            loading={loading}
            icon={<PiLockKeyDuotone />}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
