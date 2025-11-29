import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing2 from './components/Landing2'
import DashboardMain from './components/DashboardMain'
import { Toaster } from './components/ui/sonner'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing2 />} />
        <Route path="/dashboard" element={<DashboardMain />} />
        <Route path="/dashboard/:hospitalId" element={<DashboardMain />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Toaster 
        position="top-right" 
        closeButton={true}
        toastOptions={{
          style: {
            background: 'white',
            border: '3px',
          }
        }}
      />
    </Router>
  )
}

export default App