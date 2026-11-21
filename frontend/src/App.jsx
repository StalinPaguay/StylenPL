import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import WardrobePage from './pages/WardrobePage'
import './App.css'

function App() {
  const [token, setToken] = useState(null)

  function handleLogout() {
    setToken(null)
  }

  if (!token) {
    return <LoginPage onLogin={setToken} />
  }

  return <WardrobePage token={token} onLogout={handleLogout} />
}

export default App
