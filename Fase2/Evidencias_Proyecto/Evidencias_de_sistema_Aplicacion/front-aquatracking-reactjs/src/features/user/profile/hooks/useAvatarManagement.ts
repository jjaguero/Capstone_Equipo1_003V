import { useState, useRef } from 'react'
import { useUploadAvatar } from './useUploadAvatar'
import { useUpdateProfile } from './useUpdateProfile'

export const useAvatarManagement = (currentUser: any) => {
  const { uploadAvatar, uploading } = useUploadAvatar()
  const { updateProfile } = useUpdateProfile()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser?._id) return

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

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error('Error eliminando avatar:', error)
    }
  }

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview
    if (!currentUser?.avatar) return null

    if (currentUser.avatar.startsWith('http')) return currentUser.avatar
    return `http://localhost:3000${currentUser.avatar}`
  }

  return {
    avatarPreview,
    uploading,
    successMessage,
    errorMessage,
    fileInputRef,
    handleFileSelect,
    handleFileChange,
    handleRemoveAvatar,
    getAvatarUrl,
  }
}
