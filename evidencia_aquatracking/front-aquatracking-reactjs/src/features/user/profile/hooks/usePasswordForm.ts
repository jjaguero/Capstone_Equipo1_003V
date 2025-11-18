import { useState } from 'react'

export const usePasswordForm = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  const resetPasswordForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  const validatePassword = () => {
    if (passwordData.newPassword.length < 6) {
      return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' }
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return { valid: false, error: 'Las contraseñas no coinciden' }
    }
    if (!passwordData.currentPassword) {
      return { valid: false, error: 'Debes ingresar tu contraseña actual' }
    }
    return { valid: true, error: null }
  }

  return {
    passwordData,
    handlePasswordChange,
    resetPasswordForm,
    validatePassword,
  }
}
