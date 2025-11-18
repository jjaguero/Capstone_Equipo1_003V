import { createContext } from 'react'
import type { User } from '@/@types/entities'

export interface AquaTrackingAuthContextProps {
    currentUser: User | null
    authenticated: boolean
    loading: boolean
    user: User | null
    signIn: (email: string, password: string) => Promise<User>
    signOut: () => void
}

const AquaTrackingAuthContext = createContext<AquaTrackingAuthContextProps | undefined>(undefined)

export default AquaTrackingAuthContext
