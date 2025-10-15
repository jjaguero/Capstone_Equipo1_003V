import { BrowserRouter } from 'react-router'
import Theme from '@/components/template/Theme'
import AquaTrackingAuthProvider from '@/features/auth/context/AquaTrackingAuthProvider'
import { AuthProvider } from '@/auth'
import Layout from '@/components/layouts'
import Views from '@/views'
import appConfig from './configs/app.config'

if (appConfig.enableMock) {
    import('./mock')
}

function App() {
    return (
        <Theme>
            <AquaTrackingAuthProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <Layout>
                            <Views />
                        </Layout>
                    </AuthProvider>
                </BrowserRouter>
            </AquaTrackingAuthProvider>
        </Theme>
    )
}

export default App
