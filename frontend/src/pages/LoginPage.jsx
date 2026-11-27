import { useState } from 'react'
import { authService } from '../services/authService'

export default function LoginPage({ onLogin, sessionMessage = '' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authService.login({ email, password })
      onLogin(response.access_token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-layout">
      <section className="login-showcase">
        <div className="login-showcase-top">
          <span className="login-mark">✳</span>
          <span>MODA CIRCULAR · ESTILO SIN LÍMITES</span>
        </div>

        <div className="login-showcase-content">
          <span className="login-eyebrow">TU ARMARIO, NUEVAS POSIBILIDADES</span>
          <h2>Tu estilo evoluciona. Tu ropa también.</h2>
          <p>
            Organiza tus prendas, descubre nuevos estilos e intercambia
            ropa en una comunidad para todos.
          </p>

          <div className="login-benefits">
            <span>✦ Armario virtual</span>
            <span>↔ Intercambios</span>
            <span>♻ Moda sostenible</span>
          </div>
        </div>

        <div className="login-showcase-bottom">
          STYLEINPL <span>— VISTE A TU MANERA</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="login-brand">
            <span className="login-brand-icon">✳</span>
            <span>StyleInPL</span>
          </div>

          <div className="login-heading">
            <span className="login-welcome">BIENVENIDO DE NUEVO</span>
            <h1>Iniciar sesión</h1>
            <p>Accede a tu armario y sigue descubriendo nuevas posibilidades.</p>
          </div>

          {sessionMessage && <p role="status">{sessionMessage}</p>}
          {error && <p role="alert">{error}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <label className="password-toggle">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />
              Mostrar contraseña
            </label>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Entrar a mi armario →'}
            </button>
          </form>

          <p className="login-footer-note">
            Dale una segunda vida a tus prendas.
          </p>
        </div>
      </section>
    </main>
  )
}
