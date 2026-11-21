import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import WardrobePage from './pages/WardrobePage'
import ExchangePage from './pages/ExchangePage'
import './App.css'

function App() {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState('wardrobe')

  function handleLogout() {
    setToken(null)
    setPage('wardrobe')
  }

  if (!token) {
    return <LoginPage onLogin={setToken} />
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
