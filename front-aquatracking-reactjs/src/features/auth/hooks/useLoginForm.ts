import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import { useThemeStore } from '@/store/themeStore'

interface LoginFormValues {
  email: string
  password: string
}

export const useLoginForm = () => {
  const [isSubmitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const navigate = useNavigate()
  const { signIn } = useAquaTrackingAuth()
  const mode = useThemeStore((state) => state.mode)

  const form = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true)
    setErrorMessage('')

    try {
      const user = await signIn(values.email, values.password)
      navigate(user.role === 'admin' ? '/admin/overview' : '/user/overview')
    } catch (error: any) {
      setErrorMessage(error.message || 'Error al iniciar sesión')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    form,
    isSubmitting,
    errorMessage,
    mode,
    onSubmit,
  }
}
