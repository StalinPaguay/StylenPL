import { useState } from 'react'
import { authService } from '../services/authService'

export default function RegisterPage({ onBack }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      setSuccess('Cuenta creada correctamente. Ya puedes iniciar sesión.')
      setForm({ name: '', email: '', password: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-layout register-layout">
      <section className="login-showcase">
        <div className="login-showcase-top">
          <span className="login-mark">✳</span>
          <span>MODA CIRCULAR · ESTILO SIN LÍMITES</span>
        </div>

        <div className="login-showcase-content">
          <span className="login-eyebrow">BIENVENIDO A STYLEINPL</span>
          <h2>Tu ropa tiene más historias por vivir.</h2>
          <p>
            Crea tu armario virtual, organiza tus prendas y descubre
            nuevas posibilidades de intercambio para todos los estilos.
          </p>

          <div className="login-benefits">
            <span>✦ Organiza tu ropa</span>
            <span>↔ Intercambia prendas</span>
            <span>♻ Moda responsable</span>
          </div>
        </div>

        <div className="login-showcase-bottom">
          STYLEINPL <span>— TU ESTILO, TUS REGLAS</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-inner">
          <div className="login-brand">
            <span className="login-brand-icon">✳</span>
            <span>StyleInPL</span>
          </div>

          <div className="login-heading register-heading">
            <span className="login-welcome">ÚNETE A NUESTRA COMUNIDAD</span>
            <h1>Crear cuenta</h1>
            <p>Empieza a construir tu armario digital.</p>
          </div>

          {error && <p role="alert">{error}</p>}
          {success && <p role="status">{success}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Nombre completo</label>
            <input
              id="register-name"
              name="name"
              type="text"
              placeholder="Tu nombre completo"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="register-email">Correo electrónico</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={form.password}
              onChange={handleChange}
              required
            />

            <label htmlFor="register-confirm-password">
              Confirmar contraseña
            </label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <label className="password-toggle">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />
              Mostrar contraseñas
            </label>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta →'}
            </button>
          </form>

          <div className="register-bottom">
            <p>¿Ya tienes una cuenta?</p>
            <button
              className="register-back"
              type="button"
              onClick={onBack}
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
