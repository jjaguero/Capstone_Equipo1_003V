import Container from '@/components/shared/Container'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import { useSensors } from '@/features/user/sensors/hooks/useSensors'
import { useConsumption } from '@/hooks/useConsumption'
import { usePhoneFormatter } from '@/hooks/usePhoneFormatter'
import { Notification, toast } from '@/components/ui'
import {
  useProfileTabs,
  useProfileForm,
  usePasswordForm,
  useAvatarManagement,
  useConsumptionConfig,
} from '../hooks'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import {
  ProfileSidebar,
  ProfileTabContent,
  SecurityTabContent,
  NotificationsTabContent,
  ConsumptionTabContent,
} from '../components'

const UserProfilePage = () => {
  const { currentUser } = useAquaTrackingAuth()
  const { sensors } = useSensors(currentUser?.homeId)
  const { consumptions } = useConsumption(currentUser?.homeId)
  const phoneFormatter = usePhoneFormatter(currentUser?.phone || '')
  const { updateProfile } = useUpdateProfile()

  const { activeTab, setActiveTab, isProfile, isSecurity, isNotifications, isConsumption } =
    useProfileTabs()

  const profileForm = useProfileForm(currentUser, phoneFormatter)

  const passwordForm = usePasswordForm()

  const avatar = useAvatarManagement(currentUser)

  const consumptionConfig = useConsumptionConfig(
    currentUser,
    sensors.length,
    consumptions
  )

  const handlePasswordUpdate = async () => {
    const validation = passwordForm.validatePassword()
    if (!validation.valid) {
      toast.push(
        <Notification type="warning" title="Validación">
          {validation.error}
        </Notification>
      )
      return
    }

    try {
      toast.push(
        <Notification type="success" title="Éxito">
          Contraseña actualizada correctamente
        </Notification>
      )
      passwordForm.resetPasswordForm()
    } catch (error: any) {
      toast.push(
        <Notification type="danger" title="Error">
          {error.message || 'Error al actualizar contraseña'}
        </Notification>
      )
    }
  }

  const currentAvatar = avatar.getAvatarUrl()

  return (
    <Container>
      <div className="animate-fadeIn mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Configuración de Perfil
        </h3>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Administra tu cuenta y preferencias personales
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div
          className="col-span-12 animate-slideUp lg:col-span-3"
          style={{ animationDelay: '0.1s' }}
        >
          <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div
          className="col-span-12 animate-slideUp lg:col-span-9"
          style={{ animationDelay: '0.2s' }}
        >
          {isProfile && (
            <ProfileTabContent
              currentUser={currentUser}
              formData={profileForm.formData}
              isEditing={profileForm.isEditing}
              setIsEditing={profileForm.setIsEditing}
              successMessage={profileForm.successMessage}
              errorMessage={profileForm.errorMessage}
              loading={profileForm.loading}
              uploading={avatar.uploading}
              phoneFormatter={phoneFormatter}
              fileInputRef={avatar.fileInputRef as any}
              currentAvatar={currentAvatar}
              handleChange={profileForm.handleChange}
              handleSave={profileForm.handleSave}
              handleCancel={profileForm.handleCancel}
              handleFileSelect={avatar.handleFileSelect}
              handleFileChange={avatar.handleFileChange}
              handleRemoveAvatar={avatar.handleRemoveAvatar}
            />
          )}

          {isSecurity && (
            <SecurityTabContent
              passwordData={passwordForm.passwordData}
              loading={profileForm.loading}
              handlePasswordChange={passwordForm.handlePasswordChange}
              handlePasswordUpdate={handlePasswordUpdate}
            />
          )}

          {isNotifications && <NotificationsTabContent />}

          {isConsumption && (
            <ConsumptionTabContent
              currentUser={currentUser}
              sensors={sensors}
              consumptionConfig={consumptionConfig.consumptionConfig}
              setConsumptionConfig={consumptionConfig.setConsumptionConfig}
              getRealAverageConsumption={consumptionConfig.getRealAverageConsumption}
              getCalculatedLimit={consumptionConfig.getCalculatedLimit}
              updateProfile={updateProfile}
              loading={profileForm.loading}
            />
          )}
        </div>
      </div>
    </Container>
  )
}

export default UserProfilePage
