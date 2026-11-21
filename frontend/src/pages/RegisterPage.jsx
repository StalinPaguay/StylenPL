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
    <main>
      <h1>StyleInPL</h1>
      <h2>Crear cuenta</h2>

      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="register-name">Nombre completo</label>
        <input
          id="register-name"
          name="name"
          type="text"
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
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
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
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
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

        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>

      <button type="button" onClick={onBack}>
        Volver a iniciar sesión
      </button>
    </main>
  )
}


