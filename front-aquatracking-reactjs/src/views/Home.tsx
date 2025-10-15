import { Navigate } from 'react-router'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import Loading from '@/components/shared/Loading'

const Home = () => {
    const { currentUser, loading, authenticated } = useAquaTrackingAuth()

    if (loading) {
        return <Loading loading={true} />
    }

    if (!authenticated) {
        return <Navigate to="/" replace />
    }

    if (currentUser) {
        const destination = currentUser.role === 'admin' ? '/admin/overview' : '/user/overview'
        return <Navigate to={destination} replace />
    }

    return <Loading loading={true} />
}

export default Home
