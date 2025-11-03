import { BrowserRouter } from 'react-router'
import Theme from '@/components/template/Theme'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import AquaTrackingAuthProvider from '@/features/auth/context/AquaTrackingAuthProvider'
import { AuthProvider } from '@/auth'
import Layout from '@/components/layouts'
import Views from '@/views'
import { RealtimeNotification } from '@/components/shared/RealtimeNotification'
import appConfig from './configs/app.config'

if (appConfig.enableMock) {
    import('./mock')
}


function App() {
    return (
        <Theme>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <AquaTrackingAuthProvider>
                    <BrowserRouter>
                        <AuthProvider>
                            <Layout>
                                <Views />
                                <RealtimeNotification />
                            </Layout>
                        </AuthProvider>
                    </BrowserRouter>
                </AquaTrackingAuthProvider>
            </LocalizationProvider>
        </Theme>
    )
}

export default App
