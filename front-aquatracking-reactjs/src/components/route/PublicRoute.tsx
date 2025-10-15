import { Navigate, Outlet } from 'react-router'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import Loading from '@/components/shared/Loading'

const PublicRoute = () => {
    const { authenticated, currentUser, loading } = useAquaTrackingAuth()

    if (loading) {
        return <Loading loading={true} />
    }

    if (authenticated && currentUser) {
        const destination = currentUser.role === 'admin' ? '/admin/overview' : '/user/overview'
        return <Navigate to={destination} replace />
    }

    return <Outlet />
}

export default PublicRoute
