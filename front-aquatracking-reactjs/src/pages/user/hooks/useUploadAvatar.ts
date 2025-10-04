import { useState } from 'react'
import { apiClient } from '@/api/client'

export const useUploadAvatar = () => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadAvatar = async (userId: string, file: File) => {
    setUploading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await apiClient.post(
        `/upload/avatar/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al subir imagen'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return { uploadAvatar, uploading, error }
}
