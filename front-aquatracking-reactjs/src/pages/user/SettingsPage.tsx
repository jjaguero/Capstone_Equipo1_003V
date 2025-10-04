import { Card, Input, Button, Avatar, Tabs, Alert, Notification, toast, Upload } from '@/components/ui'
import { FormItem } from '@/components/ui/Form'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import { useState, useRef } from 'react'
import { PiUserDuotone, PiUploadDuotone, PiLockKeyDuotone, PiBellDuotone, PiPlugDuotone, PiTrashDuotone } from 'react-icons/pi'
import { formatRut } from '@/utils/rutFormatter'
import { useUpdateProfile } from './hooks/useUpdateProfile'
import { useUploadAvatar } from './hooks/useUploadAvatar'
import { usePhoneFormatter } from '@/hooks/usePhoneFormatter'

const { TabNav, TabList, TabContent } = Tabs

const SettingsPage = () => {
  const { currentUser, signIn } = useAquaTrackingAuth()
  const { updateProfile, loading } = useUpdateProfile()
  const { uploadAvatar, uploading } = useUploadAvatar()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Hook para formatear teléfono
  const phoneFormatter = usePhoneFormatter(currentUser?.phone || '')

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!currentUser?._id) return

    try {
      setSuccessMessage('')
      setErrorMessage('')
      
      const updatedUser = await updateProfile(currentUser._id, {
        name: formData.name,
        email: formData.email,
        phone: phoneFormatter.rawValue,
      })

      if (updatedUser) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
        window.location.reload()
      }
      
      setSuccessMessage('Perfil actualizado correctamente')
      toast.push(
        <Notification type="success" title="Éxito">
          Perfil actualizado correctamente
        </Notification>
      )
      setIsEditing(false)
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al actualizar perfil')
      toast.push(
        <Notification type="danger" title="Error">
          {error.message || 'Error al actualizar perfil'}
        </Notification>
      )
    }
  }

  const handlePasswordUpdate = async () => {
    if (!currentUser?._id) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      setSuccessMessage('')
      setErrorMessage('')
      
      await updateProfile(currentUser._id, {
        password: passwordData.newPassword,
      })

      setSuccessMessage('Contraseña actualizada correctamente')
      toast.push(
        <Notification type="success" title="Éxito">
          Contraseña actualizada correctamente
        </Notification>
      )
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al actualizar contraseña')
      toast.push(
        <Notification type="danger" title="Error">
          {error.message || 'Error al actualizar contraseña'}
        </Notification>
      )
    }
  }

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
    })
    // Resetear el formateador de teléfono
    phoneFormatter.reset()
    setIsEditing(false)
    setSuccessMessage('')
    setErrorMessage('')
    setAvatarPreview(null)
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUser?._id) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)')
      toast.push(
        <Notification type="danger" title="Error">
          Solo se permiten archivos de imagen
        </Notification>
      )
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('El archivo no debe superar los 5MB')
      toast.push(
        <Notification type="danger" title="Error">
          El archivo no debe superar los 5MB
        </Notification>
      )
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    try {
      setSuccessMessage('')
      setErrorMessage('')

      const result = await uploadAvatar(currentUser._id, file)
      
      // Guardar solo la ruta relativa (sin el http://localhost:3000)
      if (result.user) {
        localStorage.setItem('currentUser', JSON.stringify(result.user))
      }

      setSuccessMessage('Avatar actualizado correctamente')
      toast.push(
        <Notification type="success" title="Éxito">
          Avatar actualizado correctamente
        </Notification>
      )

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al subir imagen')
      setAvatarPreview(null)
      toast.push(
        <Notification type="danger" title="Error">
          {error.message || 'Error al subir imagen'}
        </Notification>
      )
    }
  }

  const handleRemoveAvatar = async () => {
    if (!currentUser?._id) return

    try {
      await updateProfile(currentUser._id, {
        avatar: '',
      })

      const updatedUser = { ...currentUser, avatar: '' }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))

      toast.push(
        <Notification type="success" title="Éxito">
          Avatar eliminado correctamente
        </Notification>
      )

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      toast.push(
        <Notification type="danger" title="Error">
          Error al eliminar avatar
        </Notification>
      )
    }
  }

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview
    if (!currentUser?.avatar) return null
    
    // Si ya tiene el protocolo http, retornar tal cual
    if (currentUser.avatar.startsWith('http')) return currentUser.avatar
    
    // Si no, agregar el prefijo del servidor
    return `http://localhost:3000${currentUser.avatar}`
  }

  const currentAvatar = getAvatarUrl()
  const avatarProps = currentAvatar
    ? { src: currentAvatar }
    : { icon: <PiUserDuotone /> }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2">Configuración</h3>
        <p className="text-gray-500">Administra tu cuenta y preferencias</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3">
          <Card className="h-full">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <PiUserDuotone className="text-xl" />
                <span className="font-medium">Perfil</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <PiLockKeyDuotone className="text-xl" />
                <span className="font-medium">Seguridad</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <PiBellDuotone className="text-xl" />
                <span className="font-medium">Notificaciones</span>
              </button>
              
              <button
                onClick={() => setActiveTab('integration')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'integration' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <PiPlugDuotone className="text-xl" />
                <span className="font-medium">Integraciones</span>
              </button>
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-9">
          {activeTab === 'profile' && (
            <Card>
              <div className="flex flex-col gap-6">
                <div>
                  <h5 className="mb-2">Información Personal</h5>
                  <p className="text-gray-500 text-sm">Actualiza tu información personal y avatar</p>
                </div>

                {successMessage && (
                  <Alert type="success" showIcon>
                    {successMessage}
                  </Alert>
                )}

                {errorMessage && (
                  <Alert type="danger" showIcon>
                    {errorMessage}
                  </Alert>
                )}

                <div className="flex items-center gap-4">
                  <Avatar size={80} {...avatarProps} />
                  <div className="flex gap-2">
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
                    >
                      {uploading ? 'Subiendo...' : 'Subir imagen'}
                    </Button>
                    {currentUser?.avatar && (
                      <Button 
                        size="sm" 
                        variant="plain"
                        icon={<PiTrashDuotone />}
                        onClick={handleRemoveAvatar}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem label="Nombre completo">
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </FormItem>

                  <FormItem label="RUT">
                    <Input
                      value={formatRut(currentUser?.rut || '')}
                      disabled
                      className="bg-gray-50 dark:bg-gray-900"
                    />
                  </FormItem>
                </div>

                <FormItem label="Correo electrónico">
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </FormItem>

                <FormItem label="Teléfono">
                  <Input
                    value={phoneFormatter.displayValue}
                    onChange={(e) => phoneFormatter.handleChange(e.target.value)}
                    disabled={!isEditing}
                    placeholder="+56 9 1234 5678"
                    maxLength={15}
                  />
                </FormItem>

                <div className="pt-6">
                  <h6 className="mb-3">Información de la Cuenta</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-sm mb-1">Rol</span>
                      <span className="font-semibold">
                        {currentUser?.role === 'admin' ? 'Administrador APR' : 'Cliente'}
                      </span>
                    </div>

                    {currentUser?.role === 'user' && (
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm mb-1">Límite diario</span>
                        <span className="font-semibold">{currentUser?.limitLitersPerDay || 0} litros/día</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                  {!isEditing ? (
                    <Button variant="solid" onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button variant="plain" onClick={handleCancel}>
                        Cancelar
                      </Button>
                      <Button variant="solid" onClick={handleSave} loading={loading}>
                        Guardar Cambios
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <div className="flex flex-col gap-6">
                <div>
                  <h5 className="mb-2">Seguridad</h5>
                  <p className="text-gray-500 text-sm">Actualiza tu contraseña y preferencias de seguridad</p>
                </div>

                {successMessage && (
                  <Alert type="success" showIcon>
                    {successMessage}
                  </Alert>
                )}

                {errorMessage && (
                  <Alert type="danger" showIcon>
                    {errorMessage}
                  </Alert>
                )}

                <div className="space-y-6">
                  <FormItem 
                    label="Contraseña actual" 
                    extra="Ingresa tu contraseña actual para confirmar los cambios"
                  >
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      placeholder="••••••••"
                    />
                  </FormItem>

                  <FormItem label="Nueva contraseña" extra="Mínimo 6 caracteres">
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      placeholder="••••••••"
                    />
                  </FormItem>

                  <FormItem label="Confirmar nueva contraseña">
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                    />
                  </FormItem>
                </div>

                <div className="flex justify-end border-t pt-8 mt-8">
                  <Button 
                    variant="solid" 
                    onClick={handlePasswordUpdate}
                    loading={loading}
                    disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    Actualizar Contraseña
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <div className="flex flex-col gap-6">
                <div>
                  <h5 className="mb-2">Notificaciones</h5>
                  <p className="text-gray-500 text-sm">Configura cómo y cuándo recibir notificaciones</p>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <PiBellDuotone className="text-5xl mx-auto mb-3 opacity-50" />
                  <p>Configuración de notificaciones próximamente</p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'integration' && (
            <Card>
              <div className="flex flex-col gap-6">
                <div>
                  <h5 className="mb-2">Integraciones</h5>
                  <p className="text-gray-500 text-sm">Conecta aplicaciones y servicios externos</p>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <PiPlugDuotone className="text-5xl mx-auto mb-3 opacity-50" />
                  <p>Integraciones disponibles próximamente</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
