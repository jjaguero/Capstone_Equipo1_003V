import { useState } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { User } from '@/@types/entities'

export const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = async (userId: string, data: Partial<User>): Promise<User | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.patch<User>(ENDPOINTS.USER_BY_ID(userId), data)
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar perfil'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { updateProfile, loading, error }
}