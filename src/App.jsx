// Initialize app services and global providers
import AppRoutes from './routes/index'
import { ToastProvider } from './context/ToastContext'
import { LocationProvider } from './context/LocationContext'
import LocationWatcherGate from './components/LocationWatcherGate'
import ProximityListener from './components/ProximityListener'

function App() {
  return (
    <ToastProvider>
      <LocationProvider>
        {/* Background location listeners for proximity features */}
        <LocationWatcherGate />
        <ProximityListener />
        <AppRoutes />
      </LocationProvider>
    </ToastProvider>
  )
}

export default App