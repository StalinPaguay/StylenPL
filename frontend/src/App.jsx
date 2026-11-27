import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WardrobePage from './pages/WardrobePage'
import ExchangePage from './pages/ExchangePage'
import ProfilePage from './pages/ProfilePage'
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
          ¿No tienes cuenta? Regístrate
        </button>
      </>
    )
  }

  return (
    <>
      <nav className="app-navigation" aria-label="Navegación principal">
        <div className="app-navigation-inner">
          <span className="app-navigation-brand">✳ StyleInPL</span>

          <div className="app-navigation-links">
            <button
              type="button"
              className={page === 'wardrobe' ? 'app-nav-active' : ''}
              aria-current={page === 'wardrobe' ? 'page' : undefined}
              onClick={() => setPage('wardrobe')}
            >
              Mi armario
            </button>

            <button
              type="button"
              className={page === 'exchanges' ? 'app-nav-active' : ''}
              aria-current={page === 'exchanges' ? 'page' : undefined}
              onClick={() => setPage('exchanges')}
            >
              Intercambios
            </button>

            <button
              type="button"
              className={page === 'profile' ? 'app-nav-active' : ''}
              aria-current={page === 'profile' ? 'page' : undefined}
              onClick={() => setPage('profile')}
            >
              Mi perfil
            </button>
          </div>
        </div>
      </nav>

      {page === 'exchanges' ? (
        <ExchangePage
          token={token}
          onBack={() => setPage('wardrobe')}
        />
      ) : page === 'profile' ? (
        <ProfilePage
          token={token}
          onPasswordChanged={() => {
            sessionService.clearToken()
            setToken(null)
            setPage('wardrobe')
            setAuthPage('login')
            setSessionMessage(
              'Tu contraseña se actualizó correctamente. Inicia sesión nuevamente.'
            )
          }}
        />
      ) : (
        <WardrobePage
          token={token}
          onLogout={() => {
            sessionService.clearToken()
            setToken(null)
            setPage('wardrobe')
            setAuthPage('login')
            setSessionMessage('')
          }}
        />
      )}
    </>
  )
}

export default App
