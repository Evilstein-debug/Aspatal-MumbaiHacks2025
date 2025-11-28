import './App.css'
import { useState } from 'react'
import Landing2 from './components/Landing2'
import DashboardMain from './components/DashboardMain'
import { Toaster } from './components/ui/sonner'

function App() {
  // In production, use proper routing (React Router)
  const [currentView, setCurrentView] = useState('landing') // 'landing' or 'dashboard'

  return (
    <>
      {currentView === 'landing' ? (
        <Landing2 onNavigateToDashboard={() => setCurrentView('dashboard')} />
      ) : (
        <DashboardMain onNavigateToLanding={() => setCurrentView('landing')} />
      )}
      <Toaster position="top-right" closeButton={true}
        toastOptions = {{
          style: {
            background: 'white',
            border: '3px',
          }
        }}
      />
    </>
  )
}

export default App
