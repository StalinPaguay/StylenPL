import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WardrobePage from './pages/WardrobePage'
import ExchangePage from './pages/ExchangePage'
import { sessionService } from './services/sessionService'
import './App.css'

function App() {
  const [token, setToken] = useState(() => sessionService.getToken())
  const [page, setPage] = useState('wardrobe')
  const [authPage, setAuthPage] = useState('login')
  const [sessionMessage, setSessionMessage] = useState('')

  useEffect(() => {
    function handleSessionExpired() {
      sessionService.clearToken()
      setSessionMessage('Tu sesión ha expirado. Inicia sesión nuevamente.')
      setToken(null)
      setPage('wardrobe')
      setAuthPage('login')
    }

    window.addEventListener('stylenpl:session-expired', handleSessionExpired)

    return () => {
      window.removeEventListener('stylenpl:session-expired', handleSessionExpired)
    }
  }, [])

  function handleLogin(accessToken) {
    sessionService.saveToken(accessToken)
    setSessionMessage('')
    setToken(accessToken)
    setPage('wardrobe')
  }

  function handleLogout() {
    sessionService.clearToken()
    setToken(null)
    setPage('wardrobe')
    setAuthPage('login')
    setSessionMessage('')
  }

  if (!token) {
    if (authPage === 'register') {
      return <RegisterPage onBack={() => setAuthPage('login')} />
    }

    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          sessionMessage={sessionMessage}
        />
        <button
          className="auth-navigation"
          type="button"
          onClick={() => setAuthPage('register')}
        >
          Crear una cuenta
        </button>
      </>
    )
  }

  if (page === 'exchanges') {
    return (
      <ExchangePage
        token={token}
        onBack={() => setPage('wardrobe')}
      />
    )
  }

  return (
    <>
      <WardrobePage token={token} onLogout={handleLogout} />
      <button
        type="button"
        onClick={() => setPage('exchanges')}
      >
        Ver intercambios
      </button>
    </>
  )
}

export default App
