import { useState, useEffect, type ReactNode } from 'react'
import { apiClient } from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { User } from '@/@types/entities'
import AquaTrackingAuthContext from './AquaTrackingAuthContext'

interface AquaTrackingAuthProviderProps {
    children: ReactNode
}

const AquaTrackingAuthProvider = ({ children }: AquaTrackingAuthProviderProps) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const validateSession = async () => {

            const storedUser = localStorage.getItem('currentUser')
            const storedServerSessionId = localStorage.getItem('serverSessionId')
            
            if (storedUser && storedServerSessionId) {
                try {
                    const response = await apiClient.get<{ serverSessionId: string }>(ENDPOINTS.SERVER_SESSION)
                    const currentServerSessionId = response.data.serverSessionId
                    if (storedServerSessionId !== currentServerSessionId) {
                        console.log('🔄 Servidor reiniciado - cerrando sesión')
                        localStorage.clear()
                        setCurrentUser(null)
                    } else {
                        setCurrentUser(JSON.parse(storedUser))
                    }
                } catch (error) {
                    console.error('Error validando sesión:', error)
                    localStorage.clear()
                    setCurrentUser(null)
                }
            }
            setLoading(false)
        }
        
        validateSession()
    }, [])

    const signIn = async (email: string, password: string): Promise<User> => {
        try {
            const response = await apiClient.get<User>(ENDPOINTS.USER_BY_EMAIL(email))
            const user = response.data

            if (user && user.password === password) {
                const userWithoutPassword = { ...user, password: undefined }
                const sessionResponse = await apiClient.get<{ serverSessionId: string }>(ENDPOINTS.SERVER_SESSION)
                const serverSessionId = sessionResponse.data.serverSessionId
                localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword))
                localStorage.setItem('serverSessionId', serverSessionId)
                
                setCurrentUser(userWithoutPassword)
                return userWithoutPassword
            } else {
                throw new Error('Contraseña incorrecta')
            }
        } catch (error: any) {
            console.error('Error en login:', error)
            console.error('Response:', error.response)
            
            if (error.response?.status === 404) {
                throw new Error('Usuario no encontrado')
            }
            if (error.response?.status === 0 || error.code === 'ERR_NETWORK') {
                throw new Error('No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3000')
            }
            if (error.message) {
                throw new Error(error.message)
            }
            throw new Error('Error al iniciar sesión')
        }
    }

    const signOut = () => {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('serverSessionId')
        localStorage.removeItem('authToken')
        setCurrentUser(null)
    }

    const value = {
        currentUser,
        authenticated: currentUser !== null,
        loading,
        user: currentUser,
        signIn,
        signOut,
    }

    return (
        <AquaTrackingAuthContext.Provider value={value}>
            {children}
        </AquaTrackingAuthContext.Provider>
    )
}

export default AquaTrackingAuthProvider
