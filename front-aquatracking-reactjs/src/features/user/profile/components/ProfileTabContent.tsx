import { Card, Input, Button, Avatar, Alert } from '@/components/ui'
import { FormItem } from '@/components/ui/Form'
import {
  PiUserDuotone,
  PiUploadDuotone,
  PiTrashDuotone,
  PiCheckDuotone,
  PiXDuotone,
  PiPencilDuotone,
} from 'react-icons/pi'
import { formatRut } from '@/utils/rutFormatter'

interface ProfileTabContentProps {
  currentUser: any
  formData: { name: string; email: string }
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  successMessage: string
  errorMessage: string
  loading: boolean
  uploading: boolean
  phoneFormatter: any
  fileInputRef: React.RefObject<HTMLInputElement>
  currentAvatar: string | null
  handleChange: (field: string, value: string) => void
  handleSave: () => void
  handleCancel: () => void
  handleFileSelect: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveAvatar: () => void
}

export const ProfileTabContent = ({
  currentUser,
  formData,
  isEditing,
  setIsEditing,
  successMessage,
  errorMessage,
  loading,
  uploading,
  phoneFormatter,
  fileInputRef,
  currentAvatar,
  handleChange,
  handleSave,
  handleCancel,
  handleFileSelect,
  handleFileChange,
  handleRemoveAvatar,
}: ProfileTabContentProps) => {
  const avatarProps = currentAvatar
    ? { src: currentAvatar }
    : { icon: <PiUserDuotone /> }

  return (
    <Card className="bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col gap-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Información Personal
            </h5>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Actualiza tu información personal y avatar
            </p>
          </div>
          {!isEditing && (
            <Button
              size="sm"
              variant="solid"
              icon={<PiPencilDuotone />}
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Editar
            </Button>
          )}
        </div>

        {successMessage && (
          <Alert type="success" showIcon className="border-emerald-200 bg-emerald-50">
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert type="danger" showIcon className="border-red-200 bg-red-50">
            {errorMessage}
          </Alert>
        )}

        <div className="flex items-center gap-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
          <Avatar size={80} {...avatarProps} className="shadow-lg ring-4 ring-white" />
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                size="sm"
                variant="solid"
                icon={<PiUploadDuotone />}
                onClick={handleFileSelect}
                loading={uploading}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {uploading ? 'Subiendo...' : 'Cambiar foto'}
              </Button>
              {currentAvatar && (
                <Button
                  size="sm"
                  variant="plain"
                  icon={<PiTrashDuotone />}
                  onClick={handleRemoveAvatar}
                  className="text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500">JPG, PNG o GIF. Máximo 5MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormItem label="Nombre completo" asterisk>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={!isEditing}
              placeholder="Tu nombre completo"
              className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
            />
          </FormItem>

          <FormItem label="Correo electrónico" asterisk>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={!isEditing}
              placeholder="tu@email.com"
              className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
            />
          </FormItem>

          <FormItem label="RUT">
            <Input
              value={formatRut(currentUser?.rut || '')}
              disabled
              placeholder="12.345.678-9"
              className="bg-gray-50 dark:bg-gray-800"
            />
          </FormItem>

          <FormItem label="Teléfono">
            <Input
              value={phoneFormatter.displayValue}
              onChange={(e) => phoneFormatter.handleChange(e.target.value)}
              disabled={!isEditing}
              placeholder="+56 9 1234 5678"
              className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
            />
          </FormItem>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button
              variant="plain"
              onClick={handleCancel}
              icon={<PiXDuotone />}
              className="text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              variant="solid"
              onClick={handleSave}
              loading={loading}
              icon={<PiCheckDuotone />}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
