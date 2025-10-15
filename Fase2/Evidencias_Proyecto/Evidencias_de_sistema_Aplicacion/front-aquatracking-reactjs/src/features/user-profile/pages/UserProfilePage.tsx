import { Card, Input, Button, Avatar, Alert, Notification, toast } from '@/components/ui'
import Container from '@/components/shared/Container'
import { FormItem } from '@/components/ui/Form'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import { useState, useRef } from 'react'
import { 
  PiUserDuotone, 
  PiUploadDuotone, 
  PiLockKeyDuotone, 
  PiBellDuotone, 
  PiPlugDuotone, 
  PiTrashDuotone,
  PiCheckDuotone,
  PiXDuotone,
  PiPencilDuotone,
  PiDropDuotone,
  PiGearDuotone,
  PiCalculatorDuotone
} from 'react-icons/pi'
import { formatRut } from '@/utils/rutFormatter'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { useUploadAvatar } from '../hooks/useUploadAvatar'
import { usePhoneFormatter } from '@/hooks/usePhoneFormatter'
import { useSensors } from '@/features/sensors/hooks/useSensors'
import { useConsumption } from '@/hooks/useConsumption'

const UserProfilePage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { updateProfile, loading } = useUpdateProfile()
  const { uploadAvatar, uploading } = useUploadAvatar()
  const { sensors } = useSensors(currentUser?.homeId)
  const { consumptions } = useConsumption(currentUser?.homeId)
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

  // Estados para configuración de consumo
  const [consumptionConfig, setConsumptionConfig] = useState({
    people: currentUser?.people || 1,
    sensors: sensors.length,
    avgConsumptionPerPerson: 150, // Litros por persona por día
    customLimit: currentUser?.limitLitersPerDay || 0,
    useAutoCalculation: true
  })

  // Cálculo de promedio de consumo real
  const getRealAverageConsumption = () => {
    if (consumptions.length === 0) return 0
    const totalConsumption = consumptions.reduce((sum, c) => sum + c.totalLiters, 0)
    return Math.round(totalConsumption / consumptions.length)
  }

  // Cálculo automático del límite
  const getCalculatedLimit = () => {
    const people = consumptionConfig.people
    const sensorsCount = sensors.length
    const avgPerPerson = consumptionConfig.avgConsumptionPerPerson
    
    // Factor de ajuste por número de sensores (más sensores = mejor control)
    const sensorFactor = sensorsCount > 0 ? 1 + (sensorsCount * 0.05) : 1.2
    
    return Math.round(people * avgPerPerson * sensorFactor)
  }

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
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('El archivo no debe superar los 5MB')
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
    
    if (currentUser.avatar.startsWith('http')) return currentUser.avatar
    return `http://localhost:3000${currentUser.avatar}`
  }

  const currentAvatar = getAvatarUrl()
  const avatarProps = currentAvatar
    ? { src: currentAvatar }
    : { icon: <PiUserDuotone /> }

  return (
    <Container>
      {/* Header */}
      <div className="mb-8 animate-fadeIn">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Configuración de Perfil
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Administra tu cuenta y preferencias personales
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="col-span-12 lg:col-span-3 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col gap-2 p-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'profile' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <PiUserDuotone className="text-xl" />
                <span className="font-medium">Perfil</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'security' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <PiLockKeyDuotone className="text-xl" />
                <span className="font-medium">Seguridad</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'notifications' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <PiBellDuotone className="text-xl" />
                <span className="font-medium">Notificaciones</span>
              </button>

              <button
                onClick={() => setActiveTab('consumption')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === 'consumption' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <PiDropDuotone className="text-xl" />
                <span className="font-medium">Consumo</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          {activeTab === 'profile' && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Información Personal
                    </h5>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Actualiza tu información personal y avatar
                    </p>
                  </div>
                  {!isEditing && (
                    <Button 
                      size="sm" 
                      variant="solid" 
                      icon={<PiPencilDuotone />}
                      onClick={() => setIsEditing(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
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

                {/* Avatar Section */}
                <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar size={80} {...avatarProps} className="ring-4 ring-white shadow-lg" />
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
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
                    <p className="text-sm text-gray-500">
                      JPG, PNG o GIF. Máximo 5MB.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {loading ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col gap-8 p-8">
                <div>
                  <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Seguridad de la Cuenta
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Actualiza tu contraseña para mantener tu cuenta segura
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 max-w-md">
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col gap-8 p-8">
                <div>
                  <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Preferencias de Notificaciones
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Configura cómo y cuándo quieres recibir notificaciones
                  </p>
                </div>

                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <PiBellDuotone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      Configuración de notificaciones
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Esta funcionalidad estará disponible próximamente
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'consumption' && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col gap-8 p-8">
                <div>
                  <h5 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Configuración de Consumo
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Ajusta los parámetros para calcular tu límite diario de consumo de agua
                  </p>
                </div>

                {/* Estadísticas actuales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <PiDropDuotone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Límite Actual</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {currentUser?.limitLitersPerDay || 0}L
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <PiGearDuotone className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sensores Activos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {sensors.length}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <PiCalculatorDuotone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Promedio Real</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {getRealAverageConsumption()}L
                    </p>
                  </div>
                </div>

                {/* Configuración de parámetros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormItem label="Número de personas en el hogar" asterisk>
                    <div className="flex items-center space-x-3">
                      <Input 
                        type="number"
                        min="1"
                        max="20"
                        value={consumptionConfig.people}
                        onChange={(e) => setConsumptionConfig(prev => ({ 
                          ...prev, 
                          people: parseInt(e.target.value) || 1 
                        }))}
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
                        onChange={(e) => setConsumptionConfig(prev => ({ 
                          ...prev, 
                          avgConsumptionPerPerson: parseInt(e.target.value) || 150 
                        }))}
                        className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-500">L/día</span>
                    </div>
                  </FormItem>
                </div>

                {/* Calculadora de límite */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h6 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Cálculo Automático
                    </h6>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        checked={consumptionConfig.useAutoCalculation}
                        onChange={(e) => setConsumptionConfig(prev => ({ 
                          ...prev, 
                          useAutoCalculation: e.target.checked 
                        }))}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Usar cálculo automático</span>
                    </label>
                  </div>

                  {consumptionConfig.useAutoCalculation ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Personas:</span>
                          <span className="font-medium">{consumptionConfig.people}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Consumo por persona:</span>
                          <span className="font-medium">{consumptionConfig.avgConsumptionPerPerson}L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sensores activos:</span>
                          <span className="font-medium">{sensors.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Factor de ajuste:</span>
                          <span className="font-medium">+{((sensors.length * 0.05) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
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
                          onChange={(e) => setConsumptionConfig(prev => ({ 
                            ...prev, 
                            customLimit: parseInt(e.target.value) || 0 
                          }))}
                          className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-500">L/día</span>
                      </div>
                    </FormItem>
                  )}
                </div>

                {/* Información y mejores prácticas */}
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <PiGearDuotone className="w-4 h-4 text-white" />
                    </div>
                    <h6 className="font-semibold text-blue-900 dark:text-blue-400">
                      Mejores Prácticas de Consumo
                    </h6>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h6 className="font-medium text-blue-900 dark:text-blue-300 text-sm">Consumo Recomendado</h6>
                          <p className="text-xs text-blue-700 dark:text-blue-400">150L por persona al día según estándares internacionales</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h6 className="font-medium text-blue-900 dark:text-blue-300 text-sm">Monitoreo Inteligente</h6>
                          <p className="text-xs text-blue-700 dark:text-blue-400">Más sensores proporcionan mayor precisión y control</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h6 className="font-medium text-blue-900 dark:text-blue-300 text-sm">Ajuste Dinámico</h6>
                          <p className="text-xs text-blue-700 dark:text-blue-400">El sistema se adapta automáticamente a tu patrón de uso</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h6 className="font-medium text-blue-900 dark:text-blue-300 text-sm">Optimización Continua</h6>
                          <p className="text-xs text-blue-700 dark:text-blue-400">Revisa periódicamente tu consumo para ajustar parámetros</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-4">
                  <Button 
                    variant="solid"
                    onClick={async () => {
                      try {
                        const newLimit = consumptionConfig.useAutoCalculation 
                          ? getCalculatedLimit()
                          : consumptionConfig.customLimit

                        await updateProfile(currentUser!._id, {
                          limitLitersPerDay: newLimit,
                          people: consumptionConfig.people
                        })

                        const updatedUser = { 
                          ...currentUser, 
                          limitLitersPerDay: newLimit,
                          people: consumptionConfig.people
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
                    }}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
                  >
                    {loading ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Container>
  )
}

export default UserProfilePage