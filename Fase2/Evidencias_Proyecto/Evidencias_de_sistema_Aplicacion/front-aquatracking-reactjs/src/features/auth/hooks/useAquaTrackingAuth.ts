import { useContext } from 'react'
import AquaTrackingAuthContext from '../context/AquaTrackingAuthContext'

export const useAquaTrackingAuth = () => {
    const context = useContext(AquaTrackingAuthContext)

    if (context === undefined) {
        throw new Error('useAquaTrackingAuth must be used within AquaTrackingAuthProvider')
    }

    const isAdmin = (): boolean => {
        return context.currentUser?.role === 'admin'
    }

    const isAuthenticated = (): boolean => {
        return context.authenticated
    }

    return {
        ...context,
        isAdmin,
        isAuthenticated,
    }
}
