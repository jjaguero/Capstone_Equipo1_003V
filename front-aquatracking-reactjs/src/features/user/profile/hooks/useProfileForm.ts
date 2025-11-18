import { useState } from 'react'
import { useUpdateProfile } from './useUpdateProfile'

export const useProfileForm = (currentUser: any, phoneFormatter: any) => {
  const { updateProfile, loading } = useUpdateProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!currentUser?._id) return

    try {
      setSuccessMessage('')
      setErrorMessage('')

      await updateProfile(currentUser._id, {
        name: formData.name,
        email: formData.email,
        phone: phoneFormatter.rawValue,
      })

      setSuccessMessage('Perfil actualizado correctamente')
      setIsEditing(false)

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al actualizar perfil')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
    })
    setIsEditing(false)
    setSuccessMessage('')
    setErrorMessage('')
  }

  return {
    formData,
    isEditing,
    setIsEditing,
    successMessage,
    errorMessage,
    loading,
    handleChange,
    handleSave,
    handleCancel,
  }
}
