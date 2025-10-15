import { Navigate, Outlet } from 'react-router'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import Loading from '@/components/shared/Loading'

const ProtectedRoute = () => {
    const { authenticated, loading } = useAquaTrackingAuth()

    if (loading) {
        return <Loading loading={true} />
    }

    if (!authenticated) {
        return <Navigate replace to="/" />
    }

    return <Outlet />
}

export default ProtectedRoute
