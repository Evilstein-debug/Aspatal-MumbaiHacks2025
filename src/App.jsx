import './App.css'
import Landing2 from './components/Landing2'
import { Toaster } from './components/ui/sonner'

function App() {


  return (
    <>
      <Landing2 />
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
