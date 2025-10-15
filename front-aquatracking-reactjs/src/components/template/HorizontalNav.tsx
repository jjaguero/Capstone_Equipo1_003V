import HorizontalMenuContent from './HorizontalMenuContent'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth'
import appConfig from '@/configs/app.config'
import navigationConfig from '@/configs/navigation.config'

const HorizontalNav = ({
    translationSetup = appConfig.activeNavTranslation,
}: {
    translationSetup?: boolean
}) => {
    const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)

    const { currentUser } = useAquaTrackingAuth()
    const userAuthority = currentUser?.role ? [currentUser.role] : []

    return (
        <HorizontalMenuContent
            navigationTree={navigationConfig}
            routeKey={currentRouteKey}
            userAuthority={userAuthority || []}
            translationSetup={translationSetup}
        />
    )
}

export default HorizontalNav
